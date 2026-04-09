"""
Script pour uploader les 17 produits sur l'API de production Render.
Lit les images depuis le dossier assets/ajout, les encode en base64,
et les envoie via l'API REST.
"""
import requests
import base64
import os
import sys
import time

# ==========================================
# CONFIGURATION
# ==========================================
API_BASE = "https://backend-1-7oti.onrender.com/api"
ADMIN_EMAIL = "benjaminadzessa@gmail.com"
ADMIN_PASSWORD = "Admin@PhC2026!"

IMAGES_DIR = r"c:\PhC\frontend\PhC\src\assets\ajout"

# Categories disponibles sur Render:
# 1=Chemises, 2=Robes, 3=Pantalons, 4=Vestes, 5=Accessoires
PRODUCTS = [
    {
        "nom": "Costume Duo Père-Fils Vert Émeraude",
        "description": "Ensemble costume élégant père-fils en tissu vert émeraude avec finitions plissées et nœud papillon assorti. Coupe moderne et raffinée.",
        "prix": 70000,
        "stock": 5,
        "category_id": 4,
        "taille": "M",
        "couleur": "Vert émeraude",
        "materiau": "Cashmere blend",
        "is_featured": True,
        "sku": "PHC-VEST-001",
        "image": "IMG-20251108-WA0001.jpg"
    },
    {
        "nom": "Blazer Gala Brodé Or & Blanc",
        "description": "Blazer de gala en tissu blanc ivoire avec broderies dorées scintillantes et nœud papillon assorti. Pièce de prestige pour les grandes occasions.",
        "prix": 65000,
        "stock": 3,
        "category_id": 4,
        "taille": "L",
        "couleur": "Blanc et Or",
        "materiau": "Soie brodée",
        "is_featured": True,
        "sku": "PHC-VEST-002",
        "image": "IMG-20251203-WA0006(1).jpg"
    },
    {
        "nom": "Ensemble Caftan Tricolore Moderne",
        "description": "Caftan moderne avec jeu de couleurs bordeaux, orange et crème. Design asymétrique contemporain avec pantalon assorti.",
        "prix": 35000,
        "stock": 8,
        "category_id": 1,
        "taille": "L",
        "couleur": "Bordeaux/Orange/Crème",
        "materiau": "Coton premium",
        "is_featured": False,
        "sku": "PHC-CHEM-001",
        "image": "IMG-20251208-WA0014.jpg"
    },
    {
        "nom": "Boubou Royal Noir Brodé Or",
        "description": "Boubou traditionnel noir avec somptueuses broderies dorées ornementales. Tenue royale pour les cérémonies et événements de prestige.",
        "prix": 55000,
        "stock": 4,
        "category_id": 1,
        "taille": "XL",
        "couleur": "Noir et Or",
        "materiau": "Bazin riche brodé",
        "is_featured": True,
        "sku": "PHC-CHEM-002",
        "image": "IMG-20251208-WA0016.jpg"
    },
    {
        "nom": "Ensemble Caftan Beige Élégant",
        "description": "Caftan long beige doré avec manches à motifs carreaux subtils et broche décorative. Confort et élégance au quotidien.",
        "prix": 30000,
        "stock": 10,
        "category_id": 1,
        "taille": "L",
        "couleur": "Beige doré",
        "materiau": "Coton satiné",
        "is_featured": False,
        "sku": "PHC-CHEM-003",
        "image": "IMG-20251208-WA0019.jpg"
    },
    {
        "nom": "Chemise Longue Blanche Lignes Noires",
        "description": "Chemise longue blanche épurée avec motifs de lignes courbes noires élégantes. Style minimaliste et raffiné.",
        "prix": 25000,
        "stock": 12,
        "category_id": 1,
        "taille": "M",
        "couleur": "Blanc et Noir",
        "materiau": "Coton premium",
        "is_featured": True,
        "sku": "PHC-CHEM-004",
        "image": "IMG-20251208-WA0023.jpg"
    },
    {
        "nom": "Caftan Blanc Broderie Dorée Asymétrique",
        "description": "Caftan blanc avec panneau de broderie dorée asymétrique et ceinture assortie. Pièce unique alliant tradition et modernité.",
        "prix": 40000,
        "stock": 6,
        "category_id": 1,
        "taille": "L",
        "couleur": "Blanc et Or",
        "materiau": "Coton brodé",
        "is_featured": False,
        "sku": "PHC-CHEM-005",
        "image": "IMG-20251208-WA0026.jpg"
    },
    {
        "nom": "Ensemble Sénateur Blanc Pur",
        "description": "Tenue sénateur blanche immaculée avec pochette contrastée et broche en cristal. Coupe classique et sobre.",
        "prix": 28000,
        "stock": 8,
        "category_id": 1,
        "taille": "M",
        "couleur": "Blanc",
        "materiau": "Coton égyptien",
        "is_featured": False,
        "sku": "PHC-CHEM-006",
        "image": "IMG-20251208-WA0028.jpg"
    },
    {
        "nom": "Caftan Blanc Boutons Décoratifs",
        "description": "Caftan blanc élégant avec boutons décoratifs noirs et coupe droite moderne. Simplicité et distinction.",
        "prix": 25000,
        "stock": 10,
        "category_id": 1,
        "taille": "L",
        "couleur": "Blanc",
        "materiau": "Coton premium",
        "is_featured": False,
        "sku": "PHC-CHEM-007",
        "image": "IMG-20251208-WA0029(1).jpg"
    },
    {
        "nom": "Chemise Blanche Col Géométrique Noir",
        "description": "Chemise longue blanche avec empiècement géométrique noir au col. Design épuré de la collection Rebirth.",
        "prix": 22000,
        "stock": 15,
        "category_id": 1,
        "taille": "M",
        "couleur": "Blanc et Noir",
        "materiau": "Coton stretch",
        "is_featured": False,
        "sku": "PHC-CHEM-008",
        "image": "IMG-20251208-WA0033.jpg"
    },
    {
        "nom": "Agbada Royal Bleu Indigo",
        "description": "Grand boubou (agbada) en bleu royal avec broderies argentées et bonnet traditionnel assorti. Tenue cérémoniale majestueuse.",
        "prix": 45000,
        "stock": 5,
        "category_id": 1,
        "taille": "XL",
        "couleur": "Bleu indigo",
        "materiau": "Cashmere bleu",
        "is_featured": True,
        "sku": "PHC-CHEM-009",
        "image": "IMG-20251208-WA0043.jpg"
    },
    {
        "nom": "Ensemble Bicolore Blanc-Bleu Marine",
        "description": "Caftan moderne blanc avec empiècements dynamiques bleu marine et beige. Design géométrique audacieux pour une allure contemporaine.",
        "prix": 35000,
        "stock": 7,
        "category_id": 1,
        "taille": "M",
        "couleur": "Blanc/Bleu marine",
        "materiau": "Coton premium",
        "is_featured": True,
        "sku": "PHC-CHEM-010",
        "image": "IMG-20251208-WA0045.jpg"
    },
    {
        "nom": "Chemise Bleu Royal Bandes Dorées",
        "description": "Chemise longue en bleu royal vif avec bandes horizontales dorées et poche décorative. Style sport-chic africain.",
        "prix": 20000,
        "stock": 15,
        "category_id": 1,
        "taille": "M",
        "couleur": "Bleu royal et Or",
        "materiau": "Coton",
        "is_featured": False,
        "sku": "PHC-CHEM-011",
        "image": "IMG-20251208-WA0047.jpg"
    },
    {
        "nom": "Ensemble Kaki Motif Damier",
        "description": "Ensemble casual chic en tissu kaki avec motif damier contrasté sur le torse. Coupe ajustée et moderne.",
        "prix": 28000,
        "stock": 8,
        "category_id": 1,
        "taille": "M",
        "couleur": "Kaki/Marron",
        "materiau": "Coton twill",
        "is_featured": False,
        "sku": "PHC-CHEM-012",
        "image": "IMG-20251208-WA0056.jpg"
    },
    {
        "nom": "Ensemble Gris Anthracite Design Origami",
        "description": "Tenue gris anthracite avec plis et formes géométriques inspirés de l'origami. Fermeture éclair décorative dorée. Style avant-gardiste.",
        "prix": 38000,
        "stock": 6,
        "category_id": 1,
        "taille": "L",
        "couleur": "Gris anthracite",
        "materiau": "Gabardine",
        "is_featured": True,
        "sku": "PHC-CHEM-013",
        "image": "IMG-20251208-WA0057.jpg"
    },
    {
        "nom": "Ensemble Bicolore Or et Crème",
        "description": "Caftan asymétrique bicolore or et crème avec coupe oblique moderne. Bonnet traditionnel assorti pour une élégance complète.",
        "prix": 32000,
        "stock": 7,
        "category_id": 1,
        "taille": "M",
        "couleur": "Or et Crème",
        "materiau": "Soie mélangée",
        "is_featured": False,
        "sku": "PHC-CHEM-014",
        "image": "IMG-20251208-WA0061.jpg"
    },
    {
        "nom": "Caftan Blanc Chevrons Rouges",
        "description": "Caftan blanc avec broderies en chevrons et ornements rouges. Pochette en wax assortie. Alliance parfaite de tradition et modernité.",
        "prix": 15000,
        "stock": 20,
        "category_id": 1,
        "taille": "M",
        "couleur": "Blanc et Rouge",
        "materiau": "Coton",
        "is_featured": False,
        "sku": "PHC-CHEM-015",
        "image": "IMG-20251208-WA0066(1).jpg"
    },
]


def image_to_base64(filepath):
    with open(filepath, "rb") as f:
        data = f.read()
    b64 = base64.b64encode(data).decode("utf-8")
    return f"data:image/jpeg;base64,{b64}"


def get_token():
    print("Authentification...")
    r = requests.post(f"{API_BASE}/token/", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if r.status_code == 200:
        token = r.json()["access"]
        print(f"Token obtenu avec succes!")
        return token
    else:
        print(f"Echec authentification: {r.status_code} - {r.text}")
        return None


def upload_products(token):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    success = 0
    errors = 0
    
    for i, product in enumerate(PRODUCTS):
        print(f"\n--- [{i+1}/{len(PRODUCTS)}] {product['nom']} ---")
        
        image_path = os.path.join(IMAGES_DIR, product["image"])
        if not os.path.exists(image_path):
            print(f"  ERREUR: Image non trouvee: {image_path}")
            errors += 1
            continue
        
        print(f"  Encodage de l'image ({product['image']})...")
        b64_image = image_to_base64(image_path)
        
        payload = {
            "nom": product["nom"],
            "description": product["description"],
            "prix": product["prix"],
            "stock": product["stock"],
            "category_id": product["category_id"],
            "taille": product.get("taille", "UNIQUE"),
            "couleur": product.get("couleur", ""),
            "materiau": product.get("materiau", ""),
            "is_featured": product.get("is_featured", False),
            "is_active": True,
            "sku": product["sku"],
            "image_principale": b64_image,
            "galerie_images": []
        }
        
        print(f"  Upload vers l'API ({product['prix']} FCFA)...")
        try:
            r = requests.post(f"{API_BASE}/products/", json=payload, headers=headers, timeout=120)
            if r.status_code == 201:
                print(f"  SUCCES! Produit cree (ID: {r.json().get('id', '?')})")
                success += 1
            else:
                print(f"  ERREUR {r.status_code}: {r.text[:300]}")
                errors += 1
        except requests.exceptions.Timeout:
            print(f"  TIMEOUT - Le serveur met trop de temps. Le produit est peut-etre en cours de creation...")
            errors += 1
        except Exception as e:
            print(f"  EXCEPTION: {e}")
            errors += 1
        
        # Petit delai entre chaque upload pour ne pas surcharger le serveur
        time.sleep(2)
    
    print(f"\n{'='*50}")
    print(f"RESULTAT FINAL: {success} succes / {errors} erreurs / {len(PRODUCTS)} total")
    print(f"{'='*50}")


if __name__ == "__main__":
    token = get_token()
    if token:
        upload_products(token)
    else:
        print("\nIMPOSSIBLE DE CONTINUER SANS TOKEN.")
        print("Etape 1: Allez sur le Shell Render et executez:")
        print("  python create_render_admin.py")
        print("Etape 2: Relancez ce script.")
