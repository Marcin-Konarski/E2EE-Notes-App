from django.shortcuts import get_object_or_404
from django.core.mail import send_mail, mail_admins, BadHeaderError
from rest_framework.decorators import action
from rest_framework.mixins import CreateModelMixin, RetrieveModelMixin, UpdateModelMixin, DestroyModelMixin
from rest_framework.viewsets import GenericViewSet #, ModelViewSet
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from templated_mail.mail import BaseEmailMessage

from .models import User, UserKey
from .serializers import UserCreateSerializer, UserSerializer, UserUpdateSerializer, UserKeySerializer


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
        send_verification_mail(request)
        return super().create(request, *args, **kwargs)


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
            return Response(serializer.data)
        elif request.method == 'PUT':
            serializer = UserUpdateSerializer(user, data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        elif request.method == 'DELETE':
            user.delete()
            return Response(user.id)


class UserKeyViewSet(CreateModelMixin, RetrieveModelMixin, DestroyModelMixin, GenericViewSet): # No list and update actions here
    queryset = UserKey.objects.all()
    serializer_class = UserKeySerializer

    def get_serializer_context(self):
        """Inserts user's id into the context to use in serializer."""
        context = super().get_serializer_context()
        context.update({'user_id': self.request.user.id})
        return context


def send_verification_mail(request):
    try:
        # send_mail('subject', 'message', 'info@arx.com', ['bob@arx.com'])
        message = BaseEmailMessage(
            template_name='emails/verify_account.html',
            context={'name': request.data.get('username')}
        )
        message.send([request.data.get('email')]) # Requires a list of recipiants
        print("email sent!!!")
    except BadHeaderError as e:
        print(e)
