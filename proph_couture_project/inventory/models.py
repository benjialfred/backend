from django.db import models
from django.conf import settings
import uuid

class Material(models.Model):
    STATUS_CHOICES = [
        ('BON_ETAT', 'Bon état'),
        ('IN_USE', 'En cours d\'utilisation à l\'atelier'),
        ('TAKEN_BACK', 'Repris par l\'apprenti'),
        ('LOST', 'Perdu'),
        ('DAMAGED', 'Endommagé'),
        ('HORS_SERVICE', 'Hors service'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='materials')
    name = models.CharField(max_length=200, verbose_name="Nom du matériel")
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    quantity = models.IntegerField(default=1, verbose_name="Quantité")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='BON_ETAT', verbose_name="État")
    date_registered = models.DateTimeField(auto_now_add=True, verbose_name="Date d'ajout")
    last_updated = models.DateTimeField(auto_now=True, verbose_name="Dernière mise à jour")

    class Meta:
        ordering = ['-date_registered']
        verbose_name = "Matériel"
        verbose_name_plural = "Matériels"

    def __str__(self):
        return f"{self.name} ({self.owner.get_full_name()})"
