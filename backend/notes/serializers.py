from django.apps import apps
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from rest_framework import serializers

from .models import Note, NoteItem

class NoteItemSerializer(serializers.ModelSerializer):
    encryption_key = serializers.CharField(write_only=True)
    class Meta:
        model = NoteItem
        fields = ['id', 'note', 'user_key', 'encryption_key', 'permission']

class BaseNoteSerializer(serializers.ModelSerializer):
    body = serializers.CharField(required=True, allow_blank=False)

    def validate_body(self, value):
        if not value:
            raise serializers.ValidationError("Body is required and cannot be empty.")
        return value.encode('utf-8')

    def to_representation(self, instance):
        data = super().to_representation(instance) # Get data
        if instance.body:
            body_bytes = bytes(instance.body) # convert body from the request to binary (cuz postgres returns memoryview object which doesn't have decode method)
            data['body'] = body_bytes.decode('utf-8') # now decode the body to in order to print readable result in the JSON response
        return data

class NotesSerializer(BaseNoteSerializer):
    noteitem = NoteItemSerializer(many=True, required=False)
    encryption_key = serializers.CharField(write_only=True, required=False)
    body = serializers.CharField(required=True, allow_blank=False)

    class Meta:
        model = Note
        fields = ['id', 'title', 'body', 'owner', 'is_encrypted', 'created_at', 'noteitem', 'encryption_key']
        read_only_fields = ['owner', 'noteitem']

    def create(self, validated_data):
        request = self.context.get('request', None)
        is_encrypted = validated_data.get('is_encrypted', False)
        encryption_key = validated_data.pop('encryption_key', None)

        if not hasattr(request, 'user') or isinstance(request.user, AnonymousUser): # If request doesn't have attribute user or user if the instance of AnonymousUser
            raise serializers.ValidationError({'detail': 'No User matches the given query.'})

        # if request and hasattr(request, 'user'): 
        validated_data['owner'] = request.user # Get currently logged in user and save it as a note owner
        note = Note.objects.create(**validated_data) # create Note object

        # If note is not encrypted than don't create NoteItem as it's not necessary (NoteItem holds public key used to encrypt this note's symmetric key -> if note is not encrypted then public key is not needed)
        if not is_encrypted:
            return note

        if not encryption_key: # If the reuqest has is_encrypted=True but encryption_key is not provided return a response
            raise serializers.ValidationError({'detail': ['Public key required for encrypted notes. Create one at POST /users/users/keys/']})

        get_user_key = self.context.get('get_user_key') # This is a function created in a NotesViewSet to verify if the user has associated UserKey object - as user without public_key cannot encrypt/decrypt the note thus UserKey record for a user is required
        if get_user_key:
            user_key = get_user_key(request.user.id)
            if not user_key:
                raise serializers.ValidationError({'non_field_errors': ['Public key required for encrypted notes. Create one at POST /users/users/keys/']})

        # #! CURRENTLY USER CAN HAVE MANY USERKEY RECORDS SO FILTER WILL RETURN A LIST OF OBJECTS
        # #TODO: DO SOMETHING WITH THIS ^^ - EITHER ADDITIONAL QUERY OR ANSURE THAT A USER CAN HAVE JUST ONE USERKEY OBJECT -- DUNNO YET
        # try:
        #     UserKey = apps.get_model(settings.AUTH_USER_KEY_MODEL) # Get the UserKey model from the settings - this approach maintains the principle of loose coupling between apps (I think)
        #     user_key = UserKey.objects.get(user=request.user.id) # Query UserKey table for record with current user's id
        # except UserKey.DoesNotExist:
        #     raise serializers.ValidationError({'detail': 'For encrypted notes public key must first be provided via: /users/users/keys/ POST endpoint'})

        if request and encryption_key: # If encryption_key exists and is_encrypted == True create NoteItem object for the current user
            NoteItem.objects.create(
                note=note,
                user_key=user_key,
                encryption_key=encryption_key.encode('utf-8'), # Convert string to bytes for BinaryField
                permission='O'
            )

        return note


class NotesDetailSerializer(BaseNoteSerializer):
    encryption_key = serializers.CharField(write_only=True, required=False)
    body = serializers.CharField(required=True, allow_blank=False)
    class Meta:
        model = Note
        fields = ['id', 'title', 'body', 'is_encrypted', 'created_at', 'encryption_key', 'noteitem']
        read_only_fields = ['id', 'is_encrypted', 'created_at', 'noteitem']


class SetEncryptionSerializer(serializers.Serializer):
    body = serializers.CharField(required=True, allow_blank=False)
    encryption = serializers.DictField(required=True)
    
    def validate_encryption(self, value):
        """Validate the encryption object structure"""
        if 'enabled' not in value:
            raise serializers.ValidationError("'enabled' field is required in encryption object")

        if not isinstance(value['enabled'], bool):
            raise serializers.ValidationError("'enabled' must be a boolean value")

        if 'key' not in value and value['enabled'] == True: # If enabled is false than the key is not necessary as we mark note as not encrypted
            raise serializers.ValidationError("'key' field is required in encryption object")
        
        if value['enabled'] and not value['key']:
            raise serializers.ValidationError("'key' cannot be empty when encryption is enabled")
        
        return value


class ShareSerializer(serializers.Serializer):
    encryption_key = serializers.CharField(write_only=True)
    class Meta:
        fields = ['id', 'user', 'encryption_key', 'permission']