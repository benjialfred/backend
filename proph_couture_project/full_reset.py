import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'proph_couture_project.settings')
django.setup()

PROJECT_APPS = [
    'users',
    'products',
    'orders',
    'cart',
    'payments',
    'api',
    'admin',
    'authtoken',
    'account',
    'socialaccount',
    'dj_rest_auth',
    'sites',
    'sessions',
    'contenttypes',
    'auth',
]

TABLES_TO_DROP = [
    'users', 'workers', 'apprentices',
    'products_product', 'products_category', 'products_model',
    'orders_order', 'orders_orderitem',
    'cart_cart', 'cart_cartitem',
    'payments_payment',
    'django_admin_log',
    'authtoken_token',
    'account_emailaddress', 'account_emailconfirmation',
    'socialaccount_socialaccount', 'socialaccount_socialapp', 'socialaccount_socialtoken',
    'django_session',
    'django_site',
    'django_content_type',
    'auth_group', 'auth_permission', 'auth_group_permissions', 'users_groups', 'users_user_permissions'
]

with connection.cursor() as cursor:
    print("Dropping ALL project tables...")
    # Using CASCADE to handle dependencies automatically
    cursor.execute("DROP SCHEMA public CASCADE;")
    cursor.execute("CREATE SCHEMA public;")
    
    print("Clearing migration history...")
    # No need to delete rows since we dropped the entire schema including django_migrations
    
    print("Done. You can now run 'python manage.py makemigrations' and 'migrate'.")
