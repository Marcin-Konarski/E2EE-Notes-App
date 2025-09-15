from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.mixins import CreateModelMixin, RetrieveModelMixin, UpdateModelMixin, DestroyModelMixin
from rest_framework.viewsets import GenericViewSet #, ModelViewSet
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import User, UserKey
from .serializers import UserCreateSerializer, UserSerializer, UserUpdateSerializer, UserKeySerializer, UserActivationSerializer, ResendActivationEmailSerializer
from .account_activation import verify_activation_key
from .tasks import send_verification_mail


class UserViewSet(CreateModelMixin, RetrieveModelMixin, UpdateModelMixin, DestroyModelMixin, GenericViewSet): # No list action here
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    # permission_classes = [AllowAny]

    def get_permissions(self):
        """Apply different permissions based on action. AllowAny is mandatory here as users would not be able to create accounts otherwise"""
        if self.request.method == 'POST':
            return [AllowAny()]
        return [IsAuthenticated()]


    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        if 201 == response.status_code: # Only if response status code is 201 send email verification mail to the specified mail in the JSON request
            user_id = response.data.get('id')
            username = response.data.get('username')
            email = response.data.get('email')
            send_verification_mail.delay(user_id, username, email)
        return (response)


    @action(detail=False, methods=['GET', 'PUT', 'DELETE'])
    def me(self, request):
        """
        GET: Displays info about specific user
        PUT: Chagnes data about specific user
        DELETE: Deletes specific user
        """
        user = get_object_or_404(User, id=request.user.id)
        if request.method == 'GET':
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif request.method == 'PUT':
            serializer = UserUpdateSerializer(user, data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif request.method == 'DELETE':
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)


class UserKeyViewSet(CreateModelMixin, RetrieveModelMixin, DestroyModelMixin, GenericViewSet): # No list and update actions here
    queryset = UserKey.objects.all()
    serializer_class = UserKeySerializer

    def get_serializer_context(self):
        """Inserts user's id into the context to use in serializer."""
        context = super().get_serializer_context()
        context.update({'user_id': self.request.user.id})
        return context

    @action(detail=False, methods=['GET'])
    def me(self, request):
        user_key = get_object_or_404(UserKey, user=request.user.id)
        serializer = UserKeySerializer(user_key).data
        return Response(serializer, status=status.HTTP_200_OK)


class UserActivationViewSet(CreateModelMixin, GenericViewSet):
    permission_classes = [AllowAny]
    serializer_class = UserActivationSerializer

    def create(self, request, *args, **kwargs):
        """Verify user's email using activation key"""

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        activation_key = serializer.validated_data['activation_key']
        user_id = verify_activation_key(activation_key)

        if not user_id:
            return Response({'status': 'Invalid or expired activation_key'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(id=user_id)
            if user.is_verified:
                return Response({'status': 'Email already verified'}, status=status.HTTP_200_OK)

            user.is_verified = True
            user.save()

            return Response({'message': 'Email verified successfully'}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({'status': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class ResendActivationEmailViewSet(CreateModelMixin, GenericViewSet):
    permission_classes = [AllowAny]
    serializer_class = ResendActivationEmailSerializer

    def create(self, request, *args, **kwargs):
        """Resend email to user with new activation key"""

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']

        if user.is_verified:
            return Response({'status': 'Email already verified'}, status=status.HTTP_200_OK)

        send_verification_mail.delay(str(user.id), user.username, user.email) # user.id must be string and not UUID object

        return Response({'message': 'Email sent successfuly'}, status=status.HTTP_200_OK)


# TODO: Only users with verified email may access those endpoints - consider creatig UserKey automatically after user verifies their email address