import os
import django
import sys
import base64
import traceback

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'proph_couture_project.settings')
django.setup()

from django.core.files.base import ContentFile
import cloudinary
import cloudinary.uploader
from test_upload import b64_image

def test_cloudinary_upload():
    print("--- Vérification de la configuration de Cloudinary ---")
    cloudinary_url = os.environ.get('CLOUDINARY_URL')
    
    if not cloudinary_url:
        print("Erreur: La variable d'environnement CLOUDINARY_URL n'est pas définie dans votre environnement de test local.")
        print("Veuillez l'ajouter (ou vérifier qu'elle est bien présente sur Render).")
        return False
        
    print(f"CLOUDINARY_URL trouvée: {cloudinary_url[:15]}... (masqué pour sécurité)")
    
    try:
        print("\nTest d'upload direct d'une petite image vers Cloudinary...")
        # Image base64 minimaliste (1 pixel)
        image_data = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        # On extrait la partie base64
        format, imgstr = image_data.split(';base64,')
        ext = format.split('/')[-1]
        
        # On crée un fichier Django ContentFile
        data = ContentFile(base64.b64decode(imgstr), name='temp.' + ext)
        
        # Tentative d'upload direct
        response = cloudinary.uploader.upload(data)
        
        print(f"SUCCÈS: L'image a été téléchargée sur Cloudinary.")
        print(f"URL de l'image : {response.get('secure_url')}")
        print("La configuration et les clés Cloudinary fonctionnent parfaitement.")
        return True
        
    except Exception as e:
        print("\nÉCHEC: L'upload vers Cloudinary a échoué.")
        print("Détail de l'erreur:")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_cloudinary_upload()
