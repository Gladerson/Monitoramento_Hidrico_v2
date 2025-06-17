from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, AddressViewSet, RecursoHidricoViewSet, DispositivoCadastradoViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'addresses', AddressViewSet)
router.register(r'recursos-hidricos', RecursoHidricoViewSet)
router.register(r'dispositivos', DispositivoCadastradoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]