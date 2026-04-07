from setuptools import setup, find_packages

setup(
    name="proph_couture",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        'Django>=4.2.0',
        'djangorestframework>=3.14.0',
        'django-cors-headers>=4.2.0',
        'mysqlclient>=2.2.0',
        'Pillow>=10.0.0',
        'python-decouple>=3.8',
        'django-filter>=23.3',
        'drf-yasg>=1.21.7',
        'djangorestframework-simplejwt>=5.3.0',
        'pyjwt>=2.8.0',
    ],
    python_requires='>=3.8',
)