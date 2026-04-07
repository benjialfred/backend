from rest_framework import viewsets, permissions
from .models import Material
from .serializers import MaterialSerializer
from users.models import UserRole

class MaterialViewSet(viewsets.ModelViewSet):
    serializer_class = MaterialSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
            return Material.objects.all().order_by('-date_registered')
        # Apprentices/Workers see their own materials
        return Material.objects.filter(owner=user).order_by('-date_registered')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
