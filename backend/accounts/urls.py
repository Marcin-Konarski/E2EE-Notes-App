from rest_framework.routers import DefaultRouter
from . import views


router = DefaultRouter()
router.register('users', views.UserViewSet)
router.register('keys', views.UserKeyViewSet)
router.register('activate', views.UserActivationViewSet, basename='activate')
router.register('resend-email', views.ResendActivationEmailViewSet, basename='resend_email')


urlpatterns = router.urls
