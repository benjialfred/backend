@echo off
echo Installation de Proph Couture...

REM Créer et activer l'environnement virtuel
python -m venv venv
call venv\Scripts\activate

REM Mettre à jour pip et setuptools
python -m pip install --upgrade pip setuptools wheel

REM Installer les dépendances
pip install -r requirements.txt

REM Faire les migrations
python manage.py makemigrations
python manage.py migrate

REM Créer un superutilisateur
echo Création du superutilisateur...
python manage.py createsuperuser

echo Installation terminée !
echo.
echo Pour démarrer le serveur : python manage.py runserver
echo Pour accéder à l'admin : http://localhost:8000/admin
pause