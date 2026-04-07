import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/6.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-&947mzy1nsvbxfco#r*klis)g+cu!w^8as*xb&hgm(07dyfelg'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False 

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '.onrender.com', '*', 'nonrepatriable-corie-initiatively.ngrok-free.dev']
'.alwaysdata.net'

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'rest_framework.authtoken',
    'drf_yasg',  # Documentation API
    'users',
    'products',
    'orders',
    'payments',
    'communications',
    'inventory',
    'cart',
    'api',

    # Authentication & Social Auth
    'django.contrib.sites',  # Required for allauth
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'dj_rest_auth',
    'dj_rest_auth.registration',
]

SITE_ID = 1

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Premier !
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # Whitenoise pour les fichiers statiques
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware', # Requis pour l'utilisation de allauth
]


# CONFIGURATION CORS (Cross-Origin Resource Sharing
# Permet au frontend React (sur les ports 5173/3000) de communiquer avec l'API Django.
# J'ai autorisé les credentials pour permettre la transmission sécurisée des cookies
# ou des Authorization headers (Tokens JWT).
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "https://nonrepatriable-corie-initiatively.ngrok-free.dev",
]

frontend_url = os.environ.get("FRONTEND_URL")
if frontend_url:
    CORS_ALLOWED_ORIGINS.append(frontend_url)

CSRF_TRUSTED_ORIGINS = [
    "https://nonrepatriable-corie-initiatively.ngrok-free.dev",
]

if frontend_url:
    CSRF_TRUSTED_ORIGINS.append(frontend_url)

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# ==========================================
# CONFIGURATION DJANGO REST FRAMEWORK (DRF)
# ==========================================
# J'ai défini JWTAuthentication comme méthode principale pour assurer l'architecture "Stateless"
# (sans session stockée sur le serveur), ce qui est idéal pour les SPA comme React.
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.TokenAuthentication',
        # 'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_SCHEMA_CLASS': 'rest_framework.schemas.coreapi.AutoSchema',
}

# ==========================================
# CONFIGURATION SIMPLE JWT

# Gestion de la durée de vie des jetons. Access = 1 jour (sécurité standard),
# Refresh = 7 jours (confort utilisateur). 
# La rotation et la mise sur liste noire garantissent que les anciens tokens ne sont plus utilisables.
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': False,

    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'JWK_URL': None,
    'LEEWAY': 0,

    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',

    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',

    'JTI_CLAIM': 'jti',

    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
}

ROOT_URLCONF = 'proph_couture_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },

]

# Email Configuration (Gmail SMTP)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'benjaminadzessa@gmail.com'
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')  # App Password provided by user
DEFAULT_FROM_EMAIL = 'Prophéti Couture <benjaminadzessa@gmail.com>'

# confihuration pour la connexion avec google
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'APP': {
            'client_id': '993342075143-n8tu19quuplendnfnmk0i7grmo4k7cqa.apps.googleusercontent.com',
            'secret': os.getenv('GOOGLE_OAUTH_SECRET', ''),
            'key': ''
        },
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        }
    }
}

# dj-rest-auth Configuration
REST_USE_JWT = True
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_AUTHENTICATION_METHOD = 'email'
ACCOUNT_EMAIL_VERIFICATION = 'none'  # Or 'mandatory' if you want email verification
ACCOUNT_USER_MODEL_USERNAME_FIELD = None


# Configuration Nelsius pour gerer les paiements
# J'utilise les variables d'environnement (os.getenv) pour ne pas exposer les clés
# secrètes directement dans le code source (Bonne pratique DevOps).
NELSIUS_API_KEY = os.getenv('NELSIUS_API_KEY', 'pk_x9vweLequ9dCuf3Oq5IW3cJTN0JBFsqT')
NELSIUS_SECRET_KEY = os.getenv('NELSIUS_SECRET_KEY', '')
NELSIUS_BASE_URL = 'https://api.nelsius.com/api/v1'  # URL API Nelsius
NELSIUS_WEBHOOK_SECRET = os.getenv('NELSIUS_WEBHOOK_SECRET', 'whsec_jg6Bz5MZLgyQoVbdpDsp8pVKg4ZsyfLv')

# Configuration SMS
SMS_API_URL = os.getenv('SMS_API_URL', 'https://api.example-sms.com/send')
SMS_API_KEY = os.getenv('SMS_API_KEY', '')
SMS_SENDER_ID = os.getenv('SMS_SENDER_ID', 'ProphCouture')



WSGI_APPLICATION = 'proph_couture_project.wsgi.application'


# Database
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases

import dj_database_url

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'phc',       # Nom n otre base donnees PostgreSQL
        'USER': 'postgres',     # nous sommes connectes avec le nom d'utilisateur postgres
        'PASSWORD': 'Nagatopain2007',#  le mot de passe pour notre connexion
        'HOST': 'localhost',           # on peut utiliser aussi une adresse Ip si on veut connecter a distance
        'PORT': '5432',                # Port PostgreSQL par défaut
    }
}

# Configuration Database URL pour Render/Production
database_url = os.environ.get("DATABASE_URL")
if database_url:
    DATABASES['default'] = dj_database_url.config(default=database_url, conn_max_age=600)

# Backend d'authentification personnalisé
AUTHENTICATION_BACKENDS = [
    'users.authentication.EmailBackend',  # Backend personnalisé pour email
    'django.contrib.auth.backends.ModelBackend',  # Backend par défaut
]

# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Africa/Douala'
USE_I18N = True
USE_TZ = True

# https://docs.djangoproject.com/en/6.0/topics/i18n/

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
# Simplified static file serving.
# https://whitenoise.readthedocs.io/en/stable/django.html#add-compression-and-caching-support
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
WHITENOISE_MANIFEST_STRICT = False  # Empêche l'application de crasher si un fichier statique manque
# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model
AUTH_USER_MODEL = 'users.User'
# Configuration des URLs de login/logout
LOGIN_URL = '/users/login/'
LOGIN_REDIRECT_URL = 'home'
LOGOUT_REDIRECT_URL = 'home'

# Configuration des sessions (optionnel)
SESSION_COOKIE_AGE = 1209600  # 2 semaines en secondes
SESSION_EXPIRE_AT_BROWSER_CLOSE = False  # Session persists after closing browser

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'