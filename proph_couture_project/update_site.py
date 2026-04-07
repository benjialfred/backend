import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'proph_couture_project.settings')
django.setup()

from django.contrib.sites.models import Site

site = Site.objects.get(pk=1)
site.domain = 'localhost:5173'
site.name = 'Proph Couture'
site.save()
print(f"Updated Site ID 1 to: {site.domain}")
