import base64
from django.conf import settings
from rest_framework import serializers

from .models import User, UserKey

class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

class UserSerializer(serializers.ModelSerializer):
    public_key = serializers.SerializerMethodField(read_only=True)
    private_key = serializers.SerializerMethodField(read_only=True)
    salt = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'public_key', 'private_key', 'salt']

    def get_public_key(self, obj):
        key = obj.keys.first()
        if not key or not key.public_key:
            return None
        return base64.b64encode(key.public_key).decode('ascii')

    def get_private_key(self, obj):
        key = obj.keys.first()
        if not key or not key.private_key:
            return None
        return base64.b64encode(key.private_key).decode('ascii')

    def get_salt(self, obj):
        key = obj.keys.first()
        if not key or not key.salt:
            return None
        return base64.b64encode(key.salt).decode('ascii')

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']
        read_only_fields = []  # Remove read_only restriction on username in order to update all provided fields

class ChangePasswordSerializer(serializers.Serializer):
    currentPassword = serializers.CharField(required=True)
    newPassword = serializers.CharField(required=True)
    confirmPassword = serializers.CharField(required=True)

    def validate(self, data):
        if data['newPassword'] != data['confirmPassword']:
            raise serializers.ValidationError({'confirmPassword': 'Passwords do not match.'})
        return data

class UserKeySerializer(serializers.ModelSerializer):
    public_key = serializers.CharField(required=True, allow_blank=False) # This field has to be CharField as otherwise public_key is not read and saved in db
    private_key = serializers.CharField(required=True, allow_blank=False)
    salt = serializers.CharField(required=True, allow_blank=False)

    class Meta:
        model = UserKey
        fields = ['id', 'user', 'public_key', 'private_key', 'salt', 'created_at']
        read_only_fields = ['created_at', 'user']

    def _encode_value(self, value, message):
        if not value or value.strip() == "":
            raise serializers.ValidationError(message)
        try:
            return base64.b64decode(value) # Convert string to bytes for BinaryField
        except Exception as e:
            raise serializers.ValidationError(f"Invalid base64 encoding: {str(e)}")

    def validate_public_key(self, value):
        message = "public_key is required and cannot be empty."
        return self._encode_value(value, message)

    def validate_private_key(self, value):
        message = "private_key is required and cannot be empty."
        return self._encode_value(value, message)

    def validate_salt(self, value):
        message = "salt is required and cannot be empty."
        return self._encode_value(value, message)

    def create(self, validated_data):
        try:
            user_id = self.context.get('user_id', None)
            user = User.objects.get(id=user_id)
            user_key = UserKey.objects.create(user=user, **validated_data)
            return user_key
        except User.DoesNotExist:
            raise serializers.ValidationError({'detail': 'User must be authenticated with valid JWT token'})

    def to_representation(self, instance): # This converts binary data to string for JSON response, otherwise GET /users/keys/<id> returns memory object instead of readable key
        """Convert binary data to base64 for JSON response"""
        data = super().to_representation(instance)

        if instance.public_key:
            data['public_key'] = base64.b64encode(instance.public_key).decode('ascii')
        if instance.private_key:
            data['private_key'] = base64.b64encode(instance.private_key).decode('ascii')
        if instance.salt:
            data['salt'] = base64.b64encode(instance.salt).decode('ascii')

        return data

class UserActivationSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True, allow_blank=False)
    otp = serializers.IntegerField(required=True)


class ResendActivationEmailSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        if not value or value.strip() == "":
            raise serializers.ValidationError("Email is required.")
        return value

    def validate(self, attrs):
        """Check if user exists with provided email and username"""
        try:
            user = User.objects.get(email=attrs['email'])
            attrs['user'] = user
        except User.DoesNotExist:
            raise serializers.ValidationError({'non_field_errors': ['No user found with this email.']})
        return attrs

# class AccessTokenSerializer(serializers.Serializer):
#     access_token = serializers.IntegerField(required=True)

#     def validate_access_token(self, value):
#         if not value or value.strip() == "":
#             raise serializers.ValidationError("access_token is required.")
#         return value.strip()

# class CredentialsSerializer(serializers.Serializer):
#     username = serializers.CharField(required=True, allow_blank=False)
#     password = serializers.CharField(required=True, allow_blank=False)

#     def validate_password(self, value):
#         if not value or value.strip() == "":
#             raise serializers.ValidationError("Email is required.")
#         return value

#     def validate_username(self, value):
#         if not value or value.strip() == "":
#             raise serializers.ValidationError("Username is required.")
#         return value.strip()