// Créez un fichier src/utils/testAPI.ts
export const testRegistrationAPI = async () => {
  console.log('🧪 Test de l\'API d\'inscription...');
  
  const testData = {
    email: `test${Date.now()}@example.com`,
    nom: 'Test',
    prenom: 'User',
    telephone: '+237612345678',
    password: 'Test1234!',
    confirm_password: 'Test1234!',
    role: 'CLIENT',
    ville: 'Yaoundé',
    pays: 'Cameroun',
    adresse_livraison: '123 Rue Test'
  };
  
  console.log('📤 Données de test:', testData);
  
  try {
    const response = await fetch('/api/users/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    const data = await response.json();
    console.log('📥 Réponse:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      data: data
    });
    
    if (!response.ok) {
      console.error('❌ Erreur:', data);
    } else {
      console.log('✅ Succès!');
    }
    
    return { response, data };
  } catch (error) {
    console.error('💥 Exception:', error);
    throw error;
  }
};

// Utilisez-le dans votre composant Register pour déboguer