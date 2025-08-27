from rest_framework.viewsets import ModelViewSet

from .models import User
from .serializers import UserCreateSerializer

class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer