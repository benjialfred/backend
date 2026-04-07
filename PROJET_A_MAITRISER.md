# PROJET PROPH COUTURE : DOCUMENTATION DE MAÎTRISE

Ce document a pour but de fournir une vue d'ensemble complète du projet **Proph Couture** et de servir de guide pour maîtriser tant le code source que l'architecture globale.

---

## 1. VUE D'ENSEMBLE DU PROJET

**Proph Couture** est une plateforme e-commerce moderne dédiée à la mode et à la couture sur mesure. Elle permet la gestion complète d'une maison de couture, de la présentation des produits à la gestion des commandes, en passant par le suivi de production et la gestion des stocks.

Le projet est divisé en deux parties principales :

1. **Backend (API)** : Développé avec Django & Django REST Framework (Python).
2. **Frontend (Interface Utilisateur)** : Développé avec React, TypeScript & Vite.

---

## 2. ARCHITECTURE TECHNIQUE

### A. Backend (Dossier `proph_couture_project`)

Le backend expose une API RESTful sécurisée.

* **Langage & Framework** : Python 3.x, Django 4.2.
* **API Framework** : Django REST Framework (DRF).
* **Base de Données** : PostgreSQL (Configuration dans `settings.py`).
* **Authentification** : JWT (JSON Web Tokens) via `djangorestframework-simplejwt`, OAuth2 (Google) via `django-allauth`.
* **Documentation API** : Swagger/OpenAPI via `drf-yasg` (accessible via `/api/swagger/`).
* **Gestion des Paiements** : Intégration Nelsius (Mobile Money/Carte).
* **Applications Django** :
  * `users` : Gestion des utilisateurs personnalisés, rôles (Client, Admin, Worker, Apprenti), authentification 2FA.
  * `products` : Catalogue, Catégories, Variantes (Taille, Couleur), Gestion des images.
  * `orders` : Gestion du cycle de vie des commandes (Panier -> Livraison), Facturation.
  * `payments` : Transactions, Sécurisation des paiements.
  * `inventory` : Suivi des stocks, Entrées/Sorties matières premières.
  * `communications` : Annonces, Notifications, Blog/Événements.
  * `api` : Point d'entrée principal pour certaines configurations globales.

### B. Frontend (Dossier `frontend/PhC`)

Le frontend est une Single Page Application (SPA) réactive.

* **Langage & Framework** : TypeScript, React 18/19.
* **Build Tool** : Vite (Rapide et léger).
* **Styling** : Tailwind CSS (Utilitaire-first CSS), Framer Motion (Animations).
* **State Management** : Redux Toolkit (Gestion globale de l'état : Auth, Panier, etc.) & Context API (Thèmes, Notifications).
* **Routing** : React Router v6/v7.
* **Appels API** : Axios (avec intercepteurs pour l'injection automatique des tokens JWT).
* **Composants Clés** :
  * `Layouts` : AdminLayout, MainLayout.
  * `Pages` : Dashboard (Admin/Client/Worker), Catalogue, Checkout, Login/Register.
  * `Guards` : `PrivateRoute`, `AdminRoute` pour sécuriser l'accès aux pages.

---

## 3. FONCTIONNALITÉS CLÉS ET FLUX DE DONNÉES

### Authentification & Sécurité

* Système de rôles robuste : Un `User` peut être un `Worker` (Employé), `Apprentice` (Apprenti) ou `Client`.
* **JWT** : Access Token (courte durée) et Refresh Token (longue durée). Le frontend gère automatiquement le rafraîchissement silencieux.
* **Google Auth** : Connexion sociale intégrée.
* **2FA** : Authentification à deux facteurs supportée (Email, App, SMS).

### Gestion des Commandes (E-commerce)

1. Le client ajoute des produits au panier (`CartContext` / Redux).
2. Processus de Checkout (`/checkout`) : Validation adresse -> Choix paiement.
3. Paiement via Nelsius : Redirection ou traitement API sécurisé.
4. Création de la commande (`Order` model) avec statut "Pending".
5. Validation paiement -> Statut "Paid" -> "In Production" -> "Shipped".

### Tableaux de Bord (Dashboards)

* **Admin** : Vue globale (Ventes, Utilisateurs, Stocks), Gestion CRUD complète.
* **Worker** : Tâches assignées, Suivi de production.
* **Apprenti** : Accès limité aux tâches et formations.
* **Client** : Historique commandes, Suivi statut, Liste de souhaits.

---

## 4. GUIDE DE DÉMARRAGE RAPIDE

### Backend

```bash
# Activer l'environnement virtuel (si utilisé)
# Windows
env\Scripts\activate

# Installation des dépendances
pip install -r requirements.txt

# Migrations Base de Données
python manage.py makemigrations
python manage.py migrate

# Créer un Super Admin
python manage.py createsuperuser

# Lancer le serveur
python manage.py runserver
```

### Frontend

```bash
cd frontend/PhC

# Installation
npm install

# Lancer en développement
npm run dev
```

---

## 5. QUESTIONNAIRE DE MAÎTRISE DU PROJET

Pour vous assurer que vous maîtrisez le projet, essayez de répondre à ces questions sans regarder le code, puis vérifiez.

### Niveau 1 : Compréhension Globale

1. **Quelle est la technologie utilisée pour l'API et quelle base de données stocke les informations ?**
    * *Réponse :* Django REST Framework (Python) et PostgreSQL.
2. **Comment le Frontend communique-t-il avec le Backend pour s'authentifier ?**
    * *Réponse :* Via des JSON Web Tokens (JWT). Le frontend envoie les crédentiels (login/pass), reçoit une paire de tokens (Access/Refresh), et stocke l'Access Token pour les requêtes suivantes (Bearer Token).
3. **Quel outil est utilisé pour le style CSS du frontend ?**
    * *Réponse :* Tailwind CSS.

### Niveau 2 : Architecture & Modèles

4. **Dans le modèle `User` (Django), comment sont gérés les différents types d'utilisateurs (Admin, Client, etc.) ?**
    * *Réponse :* Via un champ `role` (Enum : CLIENT, WORKER, ADMIN, SUPER_ADMIN) et des modèles liés comme `Worker` ou `Apprentice` pour les données spécifiques.
2. **Quelle est la différence entre un `Product` et un `Order` dans la base de données ?**
    * *Réponse :* `Product` est une définition de l'article (stock, prix, description), tandis que `Order` est une transaction liée à un `User` contenant plusieurs `OrderItem` (qui font référence au `Product` au moment de l'achat).
3. **À quoi servent les "Contexts" React (AuthContext, CartContext) dans ce projet ?**
    * *Réponse :* À partager des données globales (utilisateur connecté, contenu du panier) à travers toute l'application sans avoir à passer les "props" manuellement à chaque niveau (Props Drilling).

### Niveau 3 : Avancé & Flux

7. **Expliquez le flux de protection d'une route privée (ex: `/dashboard`) côté React.**
    * *Réponse :* Le composant `PrivateRoute` vérifie si `user` est présent dans le `AuthContext`. Si oui, il affiche l'enfant (la page). Sinon, il redirige vers `/login` via `<Navigate />`. Il gère aussi l'état de chargement (`loading`) pendant la vérification du token.
2. **Comment fonctionne la gestion des images produits ?**
    * *Réponse :* Il y a une image principale (`image_principale` dans `Product`) et une galerie d'images via le modèle `ProductImage` lié par une ForeignKey. Django stocke les fichiers dans `MEDIA_ROOT` et sert les URLs via `MEDIA_URL`.
3. **Si je veux ajouter un nouveau champ "Matériau" aux produits, quelles étapes dois-je suivre ?**
    * *Réponse :*
        1. Modifier le modèle `Product` dans `products/models.py`.
        2. Lancer `makemigrations` et `migrate`.
        3. Mettre à jour le Serializer `ProductSerializer`.
        4. Mettre à jour le formulaire React d'ajout/modification de produit et l'interface d'affichage.
4. **Quel est le rôle de `axios` et des `interceptors` dans le fichier `api.ts` (ou équivalent) ?**
    * *Réponse :* `axios` effectue les requêtes HTTP. Les intercepteurs permettent d'injecter automatiquement le token d'authentification dans chaque requête et de gérer globalement les erreurs (ex: rediriger vers login si 401 Unauthorized, ou tenter de refresh le token).

### Niveau 4 : Déploiement & Production

11. **Quelle commande sert à construire le Frontend pour la production ?**
    * *Réponse :* `npm run build` (génère le dossier `dist`).
2. **Pourquoi `DEBUG = True` ne doit jamais être laissé en production dans Django ?**
    * *Réponse :* Car cela expose des informations sensibles sur la configuration, les variables d'environnement et la structure du code en cas d'erreur (Traceback visible par l'utilisateur).

---
*Ce document résume l’essentiel pour prendre en main et faire évoluer le projet Proph Couture.*
