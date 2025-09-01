from django.apps import apps
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.mixins import CreateModelMixin, RetrieveModelMixin, UpdateModelMixin, DestroyModelMixin
from rest_framework.viewsets import GenericViewSet, ModelViewSet
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Note, NoteItem
from .serializers import NotesSerializer, NotesDetailSerializer, SetEncryptionSerializer, ShareSerializer, ShareEncryptedSerializer
from .permissions import CanReadNote, CanWriteNote, CanShareNote, CanDeleteNote, CanChangeEncryption



class NotesViewSet(CreateModelMixin, RetrieveModelMixin, UpdateModelMixin, DestroyModelMixin, GenericViewSet): # This endpoint also supports the POST request
    queryset = Note.objects.all()
    serializer_class = NotesSerializer

    def _get_user_key(self, user_id):
        """Utility method to get UserKey for a user from settings Returns UserKey instance or None if not found."""
        #! CURRENTLY USER CAN HAVE MANY USERKEY RECORDS SO FILTER WILL RETURN A LIST OF OBJECTS
        #TODO: DO SOMETHING WITH THIS ^^ - EITHER ADDITIONAL QUERY OR ANSURE THAT A USER CAN HAVE JUST ONE USERKEY OBJECT -- DUNNO YET
        try:
            UserKey = apps.get_model(settings.AUTH_USER_KEY_MODEL) # Get the UserKey model from the setting - this approach maintains the principle of loose coupling between apps (I think)
            user_key = UserKey.objects.get(user=user_id) # Query UserKey table for record with current user's id
            # print(f'user_key:\t{user_key}')
            return user_key
        except UserKey.DoesNotExist:
            return None
        except (LookupError, AttributeError):
            #TODO: Handle case where AUTH_USER_KEY_MODEL setting doesn't exist
            return None


    def get_permissions(self):
        """Apply different permissions based on action"""
        if self.action == 'retrieve':
            permission_classes = [CanReadNote]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [CanWriteNote]
        elif self.action == 'destroy':
            permission_classes = [CanDeleteNote]
        elif self.action == 'share':
            permission_classes = [CanShareNote]
        elif self.action == 'change_encryption':
            permission_classes = [CanChangeEncryption]
        else:
            permission_classes = [IsAuthenticated]  # Default

        return [permission() for permission in permission_classes]


    def get_serializer_class(self):
        if self.action in ['list', 'create']:
            return NotesSerializer # Basic info for list/create
        return NotesDetailSerializer # Detailed info for retrieve/update/delete of specific note

    def get_serializer_context(self):
        """Return owner_id in the context in order to automatically set owner id during notes creation"""
        context = super().get_serializer_context()
        context['owner_id'] = self.request.user.id # Inserts owner_id into context to use it in the NotesSerializer
        context['get_user_key'] = self._get_user_key # Pass the function to serializer so that it's reusable there :>
        return context


    @action(detail=False, methods=['GET'])
    def me(self, request):
        """Get all notes of currently logged in user"""
        notes = Note.objects.filter(owner_id=request.user.id) # query for all notes which owner_id == currently logged in user
        # if request.method == 'GET':
        data = [NotesSerializer(note).data for note in notes] # serialize all those notes
        return Response(data, status=status.HTTP_200_OK)


    # One cannot separate changing body from changing the encryption state from sending a key as those operations are tightly coupled - encrypted text without the key is useless and vice versa.
    # Marking encrypted text as not encrypted (without updating the text) would also render the text useless thus all those operations have to be combined in one endpoint
    # TODO: THIS SHOULD SET ENCRYPTION FOR ALL USERS THAT HAVE ACCESS TO THE NOTE!
    # !!!!!!!!!!!!!!!!!!!
    @action(detail=True, methods=['PUT'])
    def change_encryption(self, request, pk=None):
        """If encryption key is sent then set note as encrypted otherwise set as not encrypted. Body id always required as the representation of the note changes - encrypted text is different than unencrypted"""
        note = self.get_object() # Automatically get the note by pk from URL

        serializer = SetEncryptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        enabled = request.data.get('encryption').get('enabled')
        encryption_key = request.data.get('encryption').get('key')
        new_note_body = request.data.get('body')

        # if note.owner.id != request.user.id:
        #     return Response({'detail': ['Permission denied. Only note owner can change Note\'s encryption state']}, status=status.HTTP_403_FORBIDDEN)

        user_key = self._get_user_key(request.user.id)
        if not user_key:
            return Response({'non_field_errors': ['Public key required for encrypted notes. Create one at POST /users/users/keys/']}, status=status.HTTP_400_BAD_REQUEST)

        if enabled: # If encryption key is provided than get NoteItem object for this note
            note_item, created = NoteItem.objects.get_or_create(
                note=note,
                user_key=user_key
            )
            note_item.encryption_key = encryption_key.encode('utf-8') # Change\Set encryption key to provided one
            note_item.save() # AND SAVE THE NOTE!
            note.is_encrypted = True # Mark as encrypted
        else: # `if not enabled` means that in JSON request enabled is set to false thus notes should not be encrypted anymore
            try:
                # NoteItem.objects.get(note=note, user=request.user).delete() # Delete NoteItem for current user and current note as it's no longer needed if note is not encrypted
                NoteItem.objects.filter(note=note).update(encryption_key=None) # If Note is not to be encypted than remove encryption key for all users who have access to this note as it's no longer needed
                note.is_encrypted = False # Mark as not encrypted
            except NoteItem.DoesNotExist:
                pass

        note.body = new_note_body.encode('utf-8') # Chagne the body to provided as the representation of encrypted body is always different then not encrypted 
        note.save()

        return Response({"id": note.id, "encryption": {"enabled": enabled, "key": encryption_key}}, status=status.HTTP_200_OK)


    @action(detail=True, methods=['GET', 'POST'])
    def share(self, request, pk=None):
        """
        GET: List users who have access to this note
        POST: Share note with another user
        """
        note = self.get_object()

        if request.method == 'GET': # Return list of users with access to this note
            note_items = NoteItem.objects.filter(note=note).select_related('user_key__user')
            shared_users = [
                {
                    'user': item.user_key.user.username,
                    'permission': item.permission
                } for item in note_items
            ]
            return Response({'shared_with': shared_users})

        # POST method - share the note
        if note.is_encrypted: # Check if note is encrypted and based on that require (or don't) encryption_key in JSON
            serializer = ShareEncryptedSerializer(data=request.data)
        else:
            serializer = ShareSerializer(data=request.data) # For not encrypted notes don't require encryption_key in JSON
        serializer.is_valid(raise_exception=True)

        target_user = request.data.get('user')
        encryption_key = request.data.get('encryption_key')
        permission = request.data.get('permission')

        user_key_target = self._get_user_key(target_user) # This is a UserKey instance of a user that the note will be shared to
        user_key_current = self._get_user_key(request.user.id) # This is a UserKey of a user that shares the note

        # Verify if the target user has alreasy access to this noote
        if NoteItem.objects.filter(note=note, user_key=user_key_target).exists():
            return Response({'detail': f'User {target_user} has already access to this note'})

        # # Now in order to check if current user have permissions to share the note:
        # try:
        #     current_user_note_item = NoteItem.objects.get(note=note, user_key_id=user_key_current.id) # Get the NoteItem of a user that shares as the NoteItem has the info about the user's permissions to notes
        #     current_user_permission = current_user_note_item.permission
        # except NoteItem.DoesNotExist:
        #     # # If user is owner but has no NoteItem, allow sharing
        #     # if note.owner.id == owner_id:
        #     #     current_user_permission = 'O' #! But this should create noteitem instead. However user should __ALWAYS__ HAVE A NOTEITEM even if note is not encrypted - than only the encryption key is empty
        #     # else:
        #     return Response({'detail': 'You do not have access to this note'}, status=status.HTTP_403_FORBIDDEN)

        # if note.owner.id != request.user.id and current_user_permission not in ['S', 'O']: # Ensure only owner can share notes or user has sufficient permissions. 'O' means Owner permissions
        #     return Response({'detail': 'Permission denied. Only owner and users with owner \'permissions\' can share notes'}, status=status.HTTP_403_FORBIDDEN)

        # If note is encrypted than user to whom note will be shared to needs to have public key which allows to encrypt note's symmetric key. Otherwise return a message
        if note.is_encrypted and not user_key_target:
            return Response({'non_field_errors': [f'Public key required for encrypted notes. User {target_user} has to create UserKey at /users/users/keys/']}, status=status.HTTP_400_BAD_REQUEST)


        if note.is_encrypted:
            new_note_item = NoteItem.objects.create(
                note=note,
                user_key=user_key_target,
                encryption_key=encryption_key.encode('utf-8'), # Only for encrypted notes set encryption_key, empty otherwise
                permission=permission
            )
        else:
            new_note_item = NoteItem.objects.create(
                note=note,
                user_key=user_key_target,
                permission=permission
            )

        return Response({'detail': f'Note shared: {new_note_item.id}'}, status=status.HTTP_201_CREATED)


