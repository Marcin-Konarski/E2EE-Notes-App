from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.mixins import CreateModelMixin, RetrieveModelMixin, UpdateModelMixin, DestroyModelMixin
from rest_framework.viewsets import GenericViewSet #, ModelViewSet
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import User, UserKey
from .serializers import UserCreateSerializer, UserSerializer, UserUpdateSerializer, UserKeySerializer
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
            send_verification_mail.delay(request.data)
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


# TODO: Only users with verified email may access those endpoints - consider creatig UserKey automatically after user verifies their email address