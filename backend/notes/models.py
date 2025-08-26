from django.db import models

from django.conf import settings

from uuid import uuid4

class Note(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4)
    #! If owner_id on_delete is different than SET_NULL than change the null=False
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name='note') # Maybe change this to make it set to the last user that has permissions to this note???
    title = models.CharField(max_length=255)
    body = models.TextField()
    # status = what this was suppose to be????????????
    is_encrypted = models.BooleanField(default=False)
    created_at = models.DateField(auto_now_add=True)

    def __str__(self) -> str:
        return self.title

    class Meta:
        ordering = ['title']

class NoteItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4)
    note = models.ForeignKey(Note, on_delete=models.CASCADE, related_name='noteitem')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='noteitem')
    encryption_key = models.BinaryField()

    class Meta:
        unique_together = ("note_id", "user_id")
