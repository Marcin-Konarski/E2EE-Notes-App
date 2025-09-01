from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from rest_framework.mixins import CreateModelMixin, RetrieveModelMixin, UpdateModelMixin, DestroyModelMixin
from rest_framework.viewsets import GenericViewSet #, ModelViewSet
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import User, UserKey
from .serializers import UserCreateSerializer, UserSerializer, UserUpdateSerializer, UserKeySerializer


class UserViewSet(CreateModelMixin, RetrieveModelMixin, UpdateModelMixin, DestroyModelMixin, GenericViewSet): # No list action here
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    # permission_classes = [AllowAny]

    def get_permissions(self):
        if self.request.method == 'POST':
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=False, methods=['GET', 'PUT', 'DELETE'])
    def me(self, request):
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
        context = super().get_serializer_context()
        context.update({'user_id': self.request.user.id})
        return context
