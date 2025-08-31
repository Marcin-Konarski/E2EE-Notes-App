from django.urls import path, include
from rest_framework.routers import DefaultRouter
# from rest_framework_nested import routers

from . import views

# router = routers.DefaultRouter()
router = DefaultRouter()
router.register('users', views.UserViewSet)
router.register('keys', views.UserKeyViewSet)

# user_key_router = routers.NestedDefaultRouter(router, 'users', lookup='user') #! `pip uninstall drf-nested-routers` in order to uninstall this rest_framework_nested if not needed
# user_key_router.register('keys', views.UserKeyViewSet, basename='user-keys')


urlpatterns = router.urls # + user_key_router.urls
