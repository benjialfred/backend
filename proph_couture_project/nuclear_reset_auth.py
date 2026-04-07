import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'proph_couture_project.settings')
django.setup()

AUTH_APPS = [
    'users',
    'admin',
    'authtoken',
    'account',
    'socialaccount',
    'dj_rest_auth'
]

TABLES_TO_DROP = [
    'users',
    'workers',
    'apprentices',
    'django_admin_log',
    'authtoken_token',
    'account_emailaddress',
    'account_emailconfirmation',
    'socialaccount_socialaccount',
    'socialaccount_socialapp',
    'socialaccount_socialtoken',
    # Dependencies handling might require dropping constraints first or cascade
]

with connection.cursor() as cursor:
    print("Dropping auth-related tables...")
    for table in TABLES_TO_DROP:
        cursor.execute(f"DROP TABLE IF EXISTS {table} CASCADE")
        print(f"Dropped {table}")

    print("Clearing migration history for auth apps...")
    cursor.execute("DELETE FROM django_migrations WHERE app IN %s", (tuple(AUTH_APPS),))
    
    print("Done. You can now run 'python manage.py migrate'.")
