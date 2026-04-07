from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """
    Allows access only to Admin and Super Admin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and 
                    request.user.role in ['ADMIN', 'SUPER_ADMIN'])

class IsWorker(permissions.BasePermission):
    """
    Allows access to Workers, Admins, and Super Admins.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and 
                    request.user.role in ['WORKER', 'ADMIN', 'SUPER_ADMIN'])

class IsApprentice(permissions.BasePermission):
    """
    Allows access to Apprentices, Workers, Admins, and Super Admins.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and 
                    request.user.role in ['APPRENTI', 'WORKER', 'ADMIN', 'SUPER_ADMIN'])

class IsClient(permissions.BasePermission):
    """
    Allows access to Clients.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and 
                    request.user.role == 'CLIENT')