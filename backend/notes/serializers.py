from rest_framework import serializers

from .models import Note, NoteItem

class NoteItemSerializer(serializers.ModelSerializer):
    encryption_key = serializers.CharField(write_only=True)
    class Meta:
        model = NoteItem
        fields = ['id', 'note', 'user', 'encryption_key']

class NotesSerializer(serializers.ModelSerializer):
    # owner = serializers.UUIDField(read_only=True)
    # noteitem = NoteItemSerializer(many=True, read_only=True, required=False)
    noteitem = NoteItemSerializer(many=True, required=False)
    encryption_key = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Note
        fields = ['id', 'owner', 'title', 'body', 'is_encrypted', 'created_at', 'noteitem', 'encryption_key']
        read_only_fields = ['owner', 'noteitem']

    def create(self, validated_data):
        request = self.context.get('request', None)
        is_encrypted = validated_data.get('is_encrypted', False)
        encryption_key = validated_data.pop('encryption_key', None)

        if request and hasattr(request, 'user'): 
            validated_data['owner'] = request.user # Get currently logged in user and save it as a note owner
        note = Note.objects.create(**validated_data) # create Note object

        if request and is_encrypted and encryption_key: # If encryption_key exists and is_encrypted == True create NoteItem object for the current user
            NoteItem.objects.create(
                note=note,
                user=request.user,
                encryption_key=encryption_key.encode('utf_8') # Convert string to bytes for BinaryField
            )

        return note


class NotesDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'title', 'body', 'is_encrypted', 'created_at', 'noteitem']
        read_only_fields = ['id', 'is_encrypted', 'created_at', 'noteitem']


# class NotesSetEncryptionSerializer(serializers.ModelSerializer):
#     noteitem = NoteItemSerializer(many=True, required=False)

#     class Meta:
#         model = Note
#         fields = ['id', 'body', 'is_encrypted', 'noteitem']
#         read_only_fields = ['id']


