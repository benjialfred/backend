import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'proph_couture_project.settings')
django.setup()

with connection.cursor() as cursor:
    print("Dropping tables...")
    cursor.execute("DROP TABLE IF EXISTS users CASCADE")
    cursor.execute("DROP TABLE IF EXISTS workers CASCADE")
    cursor.execute("DROP TABLE IF EXISTS apprentices CASCADE")
    
    print("Clearing migration history...")
    cursor.execute("DELETE FROM django_migrations WHERE app='users'")
    
    print("Done.")
