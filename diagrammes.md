# Diagrammes du Projet Proph Couture

Ce document contient les modélisations principales de l'application. Vous pouvez visualiser ces diagrammes directement dans votre éditeur (comme VS Code) en utilisant une extension Markdown ou Mermaid (ex: "Markdown Preview Mermaid Support").

## 1. Diagramme des Cas d'Utilisation

L'interaction des différents acteurs avec le système.

```mermaid
usecaseDiagram
    actor Client
    actor Admin
    actor Tailleur

    package Système_Proph_Couture {
        usecase "S'authentifier" as UC1
        usecase "Passer une commande" as UC2
        usecase "Effectuer un paiement (Stripe)" as UC3
        usecase "Suivre ses commandes" as UC4
        usecase "Gérer les employés/apprentis" as UC5
        usecase "Voir le tableau de bord financier" as UC6
        usecase "Gérer l'état des commandes" as UC7
    }

    Client --> UC1
    Client --> UC2
    Client --> UC3
    Client --> UC4

    Admin --> UC1
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7

    Tailleur --> UC1
    Tailleur --> UC7
```

## 2. Diagramme de Classes

La structure simplifiée des données de l'application.

```mermaid
classDiagram
    class Utilisateur {
        +UUID id
        +String nom
        +String email
        +String motDePasse
        +String role
        +login()
        +logout()
    }

    class Client {
        +String adresse
        +String telephone
        +passerCommande()
    }

    class Employe {
        +String poste
        +gererTache()
    }

    class Commande {
        +UUID id
        +Date dateCreation
        +String statut
        +Float montantTotal
        +mettreAJourStatut()
    }

    class Paiement {
        +UUID id
        +Float montant
        +String methode
        +Date datePaiement
        +String statutStripe
        +traiterPaiement()
    }

    Utilisateur <|-- Client
    Utilisateur <|-- Employe
    Client "1" -- "*" Commande : passe
    Commande "1" -- "1" Paiement : est réglée par
    Employe "1" -- "*" Commande : traite
```

## 3. Diagramme de Séquence (Processus de Commande & Paiement)

Le parcours d'un client lors de la validation du panier et du paiement.

```mermaid
sequenceDiagram
    actor Client
    participant Frontend as Interface React
    participant Backend as API Django
    participant DB as Base de Données
    participant Stripe as Passerelle Stripe

    Client->>Frontend: Valide le panier (Checkout)
    Frontend->>Backend: Requête POST /api/commandes
    Backend->>DB: Enregistre la commande (Statut: Attente)
    Backend->>Stripe: Demande d'intention de paiement (PaymentIntent)
    Stripe-->>Backend: Retourne le Client Secret
    Backend-->>Frontend: Renvoie les infos de la commande et le secret
    Frontend->>Stripe: Confirme le paiement avec la carte bancaire
    Stripe-->>Frontend: Succès du paiement
    Stripe->>Backend: Webhook: Paiement validé
    Backend->>DB: Met à jour la commande (Statut: Payée)
    Frontend-->>Client: Affiche la page de confirmation de succès
```
