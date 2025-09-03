from django.conf import settings
from rest_framework import serializers
from djoser.serializers import UserSerializer as BaseUserSerializer, UserCreateSerializer as BaseUserCreateSerializer

from .models import User, UserKey

class UserCreateSerializer(BaseUserCreateSerializer):
    class Meta(BaseUserCreateSerializer.Meta):
        fields = ['id', 'username', 'email', 'password']

class UserSerializer(BaseUserSerializer):
    class Meta(BaseUserSerializer.Meta):
        fields = ['id', 'username', 'email']

class UserUpdateSerializer(BaseUserSerializer):
    class Meta(BaseUserSerializer.Meta):
        fields = ['id', 'username', 'email']
        read_only_fields = []  # Remove read_only restriction on username in order to update all provided fields

class UserKeySerializer(serializers.ModelSerializer):
    public_key = serializers.CharField(required=True, allow_blank=False) # This field has to be CharField as otherwise public_key is not read and saved in db

    class Meta:
        model = UserKey
        fields = ['id', 'user', 'public_key', 'created_at']
        read_only_fields = ['created_at', 'user']

    def validate_public_key(self, value):
        if not value or value.strip() == "":
            raise serializers.ValidationError("Public key is required and cannot be empty.")
        return value.encode(settings.DEFAULT_ENCODING)  # Convert string to bytes for BinaryField

    def create(self, validated_data):
        try:
            user_id = self.context.get('user_id', None)
            user = User.objects.get(id=user_id)
            user_key = UserKey.objects.create(user=user, **validated_data)
            return user_key
        except User.DoesNotExist:
            raise serializers.ValidationError({'detail': 'User must first be logged in and have valid JSON Web Token in header: /auth/jwt/create/'})

    def to_representation(self, instance): # This converts binary data to string for JSON response, otherwise GET /users/keys/<id> returns memory object instead of readable key
        data = super().to_representation(instance)
        if instance.public_key:
            public_key_bytes = bytes(instance.public_key)
            data['public_key'] = public_key_bytes.decode(settings.DEFAULT_ENCODING)
        return data

