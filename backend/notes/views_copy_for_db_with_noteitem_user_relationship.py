from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from rest_framework.mixins import CreateModelMixin, RetrieveModelMixin, UpdateModelMixin, DestroyModelMixin
from rest_framework.viewsets import GenericViewSet, ModelViewSet
from rest_framework.response import Response

from .models import Note, NoteItem
from .serializers import NotesSerializer, NotesDetailSerializer

class NotesViewSet(CreateModelMixin, RetrieveModelMixin, UpdateModelMixin, DestroyModelMixin, GenericViewSet): # This endpoint also supports the POST request
    queryset = Note.objects.all()
    serializer_class = NotesSerializer

    def get_serializer_class(self):
        if self.action in ['list', 'create']:
            return NotesSerializer # Basic info for list/create
        return NotesDetailSerializer # Detailed info for retrieve/update/delete of specific note

    def get_serializer_context(self):
        """Return owner_id in the context in order to automatically set owner id during notes creation"""
        context = super().get_serializer_context()
        context['owner_id'] = self.request.user.id # Inserts owner_id into context to use it in the NotesSerializer
        # print(f"context {context}")
        return context

    @action(detail=False, methods=['GET'])
    def me(self, request):
        """Get all notes of currently logged in user"""
        notes = Note.objects.filter(owner_id=request.user.id) # query for all notes which owner_id == currently logged in user
        if request.method == 'GET':
            data = [NotesSerializer(note).data for note in notes] # serialize all those notes
            return Response(data)

    # One cannot separate changing body from changing the encryption state from sending a key as those operations are tightly coupled - encrypted text without the key is useless and vice versa.
    # Marking encrypted text as not encrypted (without updating the text) would also render the text useless thus all those operations have to be combined in one endpoint
    @action(detail=True, methods=['PUT'])
    def set_encryption(self, request, pk=None):
        """If encryption key is sent then set note as encrypted otherwise set as not encrypted. Body id always required as the representation of the note changes - encrypted text is different than unencrypted"""
        note  = self.get_object() # Automatically get the note by pk from URL
        encryption_key = request.data.get('encryption').get('key')
        enabled = request.data.get('encryption').get('enabled')
        new_note_body = request.data.get('body')

        if enabled: # If encryption key is provided than create NoteItem object for this note
            note_item, created = NoteItem.objects.get_or_create( # Get or create a NoteItem for current user, for current note
                note=note,
                user=request.user,
                defaults={'encryption_key': encryption_key.encode('utf-8')}
            )
            note_item.encryption_key = encryption_key.encode('utf-8') # Change encryption key to provided one
            note_item.save() # AND SAVE THE NOTE!
            note.is_encrypted = True # Mark as encrypted
        else:
            try:
                NoteItem.objects.get(note=note, user=request.user).delete() # Delete NoteItem for current user and current note as it's no longer needed if note is not encrypted
            except NoteItem.DoesNotExist:
                pass # If NoteItem does not exists than there is no need to do anything since we just want to delete it
            note.is_encrypted = False # Mark as not encrypted

        note.body = new_note_body # Chagne the body to provided as the representation of encrypted body is always different then not encrypted 
        note.save()

        return Response({"id": note.id, "encryption": {"enabled": enabled, "key": encryption_key}})

