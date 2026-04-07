#!/bin/bash

API_URL="http://localhost:8000/api/users"

echo "=== Test de l'API d'authentification ==="
echo ""

# 1. Test d'inscription
echo "1. Test d'inscription..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/register/" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test_'$(date +%s)'@example.com",
    "nom": "TestUser",
    "password": "Password123!",
    "confirm_password": "Password123!"
  }')

echo "Réponse inscription: $REGISTER_RESPONSE"
echo ""

# Extraire le token et l'email
TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
EMAIL=$(echo "$REGISTER_RESPONSE" | grep -o '"email":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo "✓ Inscription réussie"
    echo "Token: $TOKEN"
    echo "Email: $EMAIL"
    echo ""
    
    # 2. Test de connexion
    echo "2. Test de connexion..."
    LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/login/" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "'"$EMAIL"'",
        "password": "Password123!"
      }')
    
    echo "Réponse connexion: $LOGIN_RESPONSE"
    echo ""
    
    # 3. Test du profil
    echo "3. Test du profil utilisateur..."
    PROFILE_RESPONSE=$(curl -s -X GET "$API_URL/me/" \
      -H "Authorization: Token $TOKEN")
    
    echo "Réponse profil: $PROFILE_RESPONSE"
    echo ""
    
    # 4. Test de déconnexion
    echo "4. Test de déconnexion..."
    LOGOUT_RESPONSE=$(curl -s -X POST "$API_URL/logout/" \
      -H "Authorization: Token $TOKEN")
    
    echo "Réponse déconnexion: $LOGOUT_RESPONSE"
else
    echo "✗ Échec de l'inscription"
    echo "Détails: $REGISTER_RESPONSE"
fi

echo ""
echo "=== Test terminé ==="