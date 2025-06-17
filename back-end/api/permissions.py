from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdminUser(BasePermission):
    """
    Permite acesso apenas a usuários com a role ADMIN.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')

class IsOperatorUser(BasePermission):
    """
    Permite acesso a usuários com a role OPERATOR.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'OPERATOR')

class IsAdminOrOperator(BasePermission):
    """
    Permite acesso a ADMIN ou OPERATOR.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'ADMIN' or request.user.role == 'OPERATOR'))
        
class IsOwnerOrAdmin(BasePermission):
    """
    Permite que donos de um objeto o editem, ou admins.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'ADMIN':
            return True
        # Assumindo que o objeto tem um atributo 'user' ou 'proprietario'
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'proprietario'):
            return obj.proprietario == request.user
        return False