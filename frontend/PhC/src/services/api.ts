// src/services/api.ts - VERSION COMPLÈTE ET CORRIGÉE

import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import type {
  User,
  Product,
  Category,
  Order,
  LoginFormData,
  RegisterFormData,
  AuthResponse,
  Model,
  UserMeasurements,
  Material,
  Withdrawal,
  Apprentice,
  Worker,
} from '@/types';

export interface ContactMessageData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Configuration de base de l'API
// Utilisez l'URL locale pour le développement, et l'URL Render en production
const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const PROD_API_URL = import.meta.env.VITE_API_URL || 'https://backend-1-7oti.onrender.com/api';
const API_BASE_URL = isProduction ? PROD_API_URL : 'http://127.0.0.1:8000/api';
export const NELSIUS_PUBLIC_KEY = 'pk_live_X1LuS9T6uy0vMWeXCDExjOmKrju3yuXF';

// Interface étendue pour inclure la propriété _retry
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// ==========================================
// 1. CONFIGURATION DE BASE AXIOS
// ==========================================
// Création d'une instance Axios centralisée. Cela permet de paramétrer une seule fois
// les headers par défaut, l'URL de base et le Timeout (important pour les paiements lents).
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000, // Timeout augmenté à 45s spécifiquement pour l'API Nelsius / Mobile Money
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Pas besoin de cookies car on utilise une stratégie JWT locale
});

// Stockage du token JWT
const getJWTToken = (): string | null => {
  return localStorage.getItem('access_token');
};

const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token');
};

// ==========================================
// 2. INTERCEPTEUR DE REQUÊTES (INJECTION DU TOKEN)
// ==========================================
// Avant chaque requête sortante, on récupère le JWT en LocalStorage et on l'injecte
// automatiquement dans les headers. J'ai choisi cette méthode car elle est transparente
// pour le reste du code de l'application.
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getJWTToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Gestion spécifique: Si on upload une image (FormData), on laisse le navigateur
    // gérer lui-même le boundary du Content-Type, sinon l'upload échoue.
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Base URL du Backend (sans le /api final) pour reconstruire les liens des images
const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const fixImageUrls = (obj: any) => {
  if (!obj || typeof obj !== 'object') return;
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (typeof value === 'string' && value.startsWith('/media/')) {
      obj[key] = `${BACKEND_URL}${value}`;
    } else if (typeof value === 'object' && value !== null) {
      fixImageUrls(value);
    }
  });
};

// Intercepteur pour les succès et pour rafraîchir le token JWT
apiClient.interceptors.response.use(
  (response) => {
    if (response.data) {
      fixImageUrls(response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Si erreur 401 (non autorisé) et pas déjà retenté
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          // Utilisez l'instance axios normale pour éviter la récursion
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          // Mettre à jour le header et réessayer
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Si le refresh échoue, nettoyer le stockage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');

        // Retenter la requête de manière anonyme (sans token)
        if (originalRequest.headers) {
          delete originalRequest.headers.Authorization;
        }
        return apiClient(originalRequest);
      }

      // Si pas de refresh token, on tente aussi sans token
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      if (originalRequest.headers) {
        delete originalRequest.headers.Authorization;
      }
      return apiClient(originalRequest);
    }

    return Promise.reject(error);
  }
);

// Service d'authentification
export const authAPI = {
  // Vérifier la disponibilité d'un email
  checkEmail: async (email: string): Promise<{ exists: boolean; message?: string }> => {
    try {
      const response = await apiClient.post('/users/check-email/', { email });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { exists: false, message: 'Email non trouvé' };
      }
      console.error('Erreur checkEmail:', error);
      throw error;
    }
  },

  // Connexion Google
  googleLogin: async (data: { access_token: string }): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/users/google/', data);
      const responseData = response.data;
      // Stocker le token et les infos utilisateur
      if (responseData.key) {
        localStorage.setItem('access_token', responseData.key);
      }
      // Note: dj-rest-auth might return 'key' instead of 'token', or both depending on config
      // Also it might not return the full user object, so we might need to fetch profile after
      // But typically with default serializers it does return key.
      // Let's assume standard behavior for now but catch if user is missing.

      if (!responseData.user) {
        // Optionally fetch user profile if not returned
        // But for now let's hope it's customized or standard enough
        try {
          // Temporary set token to allow this call
          if (responseData.key) localStorage.setItem('access_token', responseData.key);
          const userResponse = await apiClient.get('/users/me/');
          localStorage.setItem('user', JSON.stringify(userResponse.data));
          return {
            ...responseData,
            token: responseData.key || responseData.token, // Normalize token key
            user: userResponse.data
          };
        } catch (e) {
          console.error("Could not fetch user profile after social login", e);
        }
      } else {
        localStorage.setItem('user', JSON.stringify(responseData.user));
      }

      return {
        ...responseData,
        token: responseData.key || responseData.token
      };
    } catch (error: any) {
      console.error('Erreur Google Login:', error);
      throw {
        message: 'Erreur lors de la connexion Google',
        response: error.response
      };
    }
  },

  // Connexion avec votre endpoint Django
  login: async (data: LoginFormData): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/users/login/', data);
      const responseData = response.data;

      // Stocker le token et les infos utilisateur
      if (responseData.token) {
        localStorage.setItem('access_token', responseData.token);
      }
      if (responseData.user) {
        localStorage.setItem('user', JSON.stringify(responseData.user));
      }

      return responseData;
    } catch (error: any) {
      console.error('Erreur de connexion:', error.response?.data);

      const errorData = error.response?.data || {};
      let errorMessage = errorData.detail || errorData.error || errorData.non_field_errors?.[0];

      if (!error.response || error.message === 'Network Error') {
          errorMessage = "Impossible de joindre le serveur. Vérifiez votre connexion internet.";
      } else if (error.response?.status === 403) {
        errorMessage = errorMessage || 'Compte désactivé ou bloqué';
      } else if (error.response?.status === 401) {
        errorMessage = errorMessage || 'Email ou mot de passe incorrect';
      }

      throw {
        message: errorMessage || 'Erreur lors de la connexion',
        response: error.response
      };
    }
  },

  // Demander la réinitialisation du mot de passe
  forgotPassword: async (data: { email: string }): Promise<void> => {
    try {
      await apiClient.post('/users/forgot-password/', data);
    } catch (error) {
      console.error('Erreur forgotPassword:', error);
      throw error;
    }
  },

  // Vérifier le code OTP
  verifyOTP: async (data: { email: string; otp: string }): Promise<void> => {
    try {
      await apiClient.post('/users/verify-otp/', data);
    } catch (error) {
      console.error('Erreur verifyOTP:', error);
      throw error;
    }
  },

  // Réinitialiser le mot de passe
  resetPassword: async (data: any): Promise<void> => {
    try {
      await apiClient.post('/users/reset-password/', data);
    } catch (error) {
      console.error('Erreur resetPassword:', error);
      throw error;
    }
  },

  // Configurer 2FA
  setup2FA: async (data: { password?: string }): Promise<{ secret: string; qr_code: string }> => {
    try {
      const response = await apiClient.post('/users/2fa/setup/', data);
      return response.data;
    } catch (error) {
      console.error('Erreur setup2FA:', error);
      throw error;
    }
  },

  // Vérifier 2FA
  verify2FA: async (data: { otp: string }): Promise<void> => {
    try {
      await apiClient.post('/users/2fa/verify/', data);
    } catch (error) {
      console.error('Erreur verify2FA:', error);
      throw error;
    }
  },

  // Désactiver 2FA
  disable2FA: async (): Promise<void> => {
    try {
      await apiClient.post('/users/2fa/disable/');
    } catch (error) {
      console.error('Erreur disable2FA:', error);
      throw error;
    }
  },

  // Inscription avec gestion d'erreur améliorée
  register: async (data: RegisterFormData): Promise<AuthResponse> => {
    try {
      console.log('📤 Envoi des données d\'inscription:', data);

      // Formatez les données selon ce que votre backend attend
      const formattedData = {
        email: data.email.trim(),
        nom: data.nom.trim(),
        prenom: data.prenom?.trim() || '',
        telephone: data.telephone?.trim() || '',
        password: data.password,
        confirm_password: data.confirm_password,
        role: data.role || 'CLIENT',
        ville: data.ville?.trim() || '',
        pays: data.pays?.trim() || 'Cameroun',
        adresse_livraison: data.adresse_livraison?.trim() || '',
      };

      console.log('📤 Données formatées envoyées:', formattedData);

      const response = await apiClient.post('/users/register/', formattedData);
      console.log('📥 Réponse d\'inscription:', response.data);

      const responseData = response.data;

      // Stocker le token et les infos utilisateur
      if (responseData.token) {
        localStorage.setItem('access_token', responseData.token);
      }
      if (responseData.refresh) {
        localStorage.setItem('refresh_token', responseData.refresh);
      }
      if (responseData.user) {
        localStorage.setItem('user', JSON.stringify(responseData.user));
      }

      return responseData;

    } catch (error: any) {
      console.error('❌ Erreur d\'inscription:', {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });

      let errorMessage = 'Erreur lors de l\'inscription';
      const errorData = error.response?.data;

      if (errorData) {
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.non_field_errors) {
          errorMessage = Array.isArray(errorData.non_field_errors)
            ? errorData.non_field_errors.join(', ')
            : errorData.non_field_errors;
        } else if (typeof errorData === 'object') {
          // Formatez les erreurs de validation
          const fieldErrors = Object.entries(errorData)
            .map(([field, messages]) => {
              const fieldName = field === 'password2' ? 'Confirmation du mot de passe' :
                field === 'password' ? 'Mot de passe' :
                  field === 'confirm_password' ? 'Confirmation du mot de passe' :
                    field === 'nom' ? 'Nom' :
                      field === 'prenom' ? 'Prénom' :
                        field === 'email' ? 'Email' :
                          field === 'pays' ? 'Pays' :
                            field === 'ville' ? 'Ville' :
                              field === 'adresse_livraison' ? 'Adresse de livraison' :
                                field === 'role' ? 'Rôle' :
                                  field;

              const messageText = Array.isArray(messages)
                ? messages.join(', ')
                : String(messages);

              return `${fieldName}: ${messageText}`;
            })
            .join('\n');

          errorMessage = fieldErrors || JSON.stringify(errorData);
        }
      }

      if (error.response?.status === 500) {
        errorMessage = 'Erreur interne du serveur. Veuillez réessayer plus tard.';
      }

      throw {
        message: errorMessage,
        response: error.response
      };
    }
  },

  // Déconnexion
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/users/logout/');
    } catch (error) {
      console.warn('Endpoint logout non disponible ou erreur');
    } finally {
      // Nettoyer le localStorage dans tous les cas
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  // Récupérer le profil utilisateur
  getProfile: async (): Promise<User> => {
    try {
      const response = await apiClient.get('/users/me/');
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error: any) {
      console.error('Erreur getProfile:', error);
      throw error;
    }
  },

  // Mettre à jour le profil
  updateProfile: async (data: Partial<User>): Promise<User> => {
    try {
      const response = await apiClient.put('/users/me/update/', data);
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Erreur updateProfile:', error);
      throw error;
    }
  },

  // Rafraîchir le token JWT (si vous utilisez JWT)
  refreshToken: async (): Promise<{ access: string }> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('Aucun token de rafraîchissement disponible');
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
        refresh: refreshToken
      });
      const { access } = response.data;
      localStorage.setItem('access_token', access);
      return { access };
    } catch (error) {
      console.error('Erreur refreshToken:', error);
      throw error;
    }
  },

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated: (): boolean => {
    return !!getJWTToken();
  },

  // Récupérer l'utilisateur courant depuis localStorage
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  },

  // Récupérer le token
  getToken: (): string | null => {
    return getJWTToken();
  },

  // Changer le mot de passe
  changePassword: async (data: {
    old_password: string;
    new_password: string;
    confirm_password: string;
  }): Promise<{ message: string }> => {
    try {
      const response = await apiClient.put('/users/me/change-password/', data);
      return response.data;
    } catch (error) {
      console.error('Erreur changePassword:', error);
      throw error;
    }
  },
};

// Service pour les produits
export const productAPI = {
  // Récupérer toutes les catégories
  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await apiClient.get('/products/categories/');
      return response.data;
    } catch (error) {
      console.error('Erreur getCategories:', error);
      throw error;
    }
  },

  // Récupérer tous les produits
  getAll: async (params?: any): Promise<{ results: Product[]; count: number }> => {
    try {
      const response = await apiClient.get('/products/', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur products.getAll:', error);
      throw error;
    }
  },

  // Récupérer un produit par ID
  getById: async (id: number | string): Promise<Product> => {
    try {
      const response = await apiClient.get(`/products/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Erreur products.getById:', error);
      throw error;
    }
  },

  // Créer un produit
  create: async (data: any): Promise<Product> => {
    try {
      const response = await apiClient.post('/products/', data);
      return response.data;
    } catch (error) {
      console.error('Erreur products.create:', error);
      throw error;
    }
  },

  // Mettre à jour un produit
  update: async (id: number | string, data: any): Promise<Product> => {
    try {
      const response = await apiClient.put(`/products/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur products.update:', error);
      throw error;
    }
  },

  // Mettre à jour partiellement un produit
  patch: async (id: number | string, data: any): Promise<Product> => {
    try {
      const response = await apiClient.patch(`/products/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur products.patch:', error);
      throw error;
    }
  },

  // Supprimer un produit
  delete: async (id: number | string): Promise<void> => {
    try {
      await apiClient.delete(`/products/${id}/`);
    } catch (error) {
      console.error('Erreur products.delete:', error);
      throw error;
    }
  },

  // Toggle featured status
  toggleFeatured: async (id: number | string): Promise<Product> => {
    try {
      const response = await apiClient.patch(`/products/${id}/toggle_featured/`, {});
      return response.data;
    } catch (error) {
      console.error('Erreur toggleFeatured:', error);
      throw error;
    }
  },

  // Toggle active status
  toggleActive: async (id: number | string): Promise<Product> => {
    try {
      const response = await apiClient.patch(`/products/${id}/toggle_active/`, {});
      return response.data;
    } catch (error) {
      console.error('Erreur toggleActive:', error);
      throw error;
    }
  },

  // Add Comment
  addComment: async (id: number | string, data: { rating: number; comment_text: string; is_anonymous?: boolean }): Promise<any> => {
    try {
      const response = await apiClient.post(`/products/${id}/add_comment/`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur addComment:', error);
      throw error;
    }
  },

  // Get Comments for Product
  getComments: async (id: number | string): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/products/${id}/comments/`);
      return response.data;
    } catch (error) {
      console.error('Erreur getComments:', error);
      throw error;
    }
  },

  // Get My Comments
  getMyComments: async (): Promise<any> => {
      try {
          const response = await apiClient.get('/products/my-comments/');
          return response.data;
      } catch (error) {
          console.error("Erreur getMyComments:", error);
          throw error;
      }
  },

  // Get Favorites
  getFavorites: async (): Promise<Product[]> => {
      try {
          const response = await apiClient.get('/products/favorites/');
          return response.data;
      } catch (error) {
          console.error("Erreur getFavorites:", error);
          throw error;
      }
  },

  // Toggle Favorite
  toggleFavoriteAPI: async (id: number | string): Promise<any> => {
      try {
          const response = await apiClient.post(`/products/${id}/toggle_favorite/`);
          return response.data;
      } catch (error) {
          console.error("Erreur toggleFavoriteAPI:", error);
          throw error;
      }
  }
};

// Service pour les modèles
export const modelAPI = {
  getAll: async (): Promise<Model[]> => {
    try {
      const response = await apiClient.get('/products/models/');
      return response.data;
    } catch (error) {
      console.error('Erreur modelAPI.getAll:', error);
      throw error;
    }
  },

  create: async (data: any): Promise<Model> => {
    try {
      const response = await apiClient.post('/products/models/', data);
      return response.data;
    } catch (error) {
      console.error('Erreur modelAPI.create:', error);
      throw error;
    }
  },

  update: async (id: number, data: any): Promise<Model> => {
    try {
      const response = await apiClient.patch(`/products/models/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur modelAPI.update:', error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/products/models/${id}/`);
    } catch (error) {
      console.error('Erreur modelAPI.delete:', error);
      throw error;
    }
  }
};

// Service pour les utilisateurs (admin)
export const userAPI = {
  getUsers: async (params?: any): Promise<{ results: User[]; count: number }> => {
    try {
      const response = await apiClient.get('/users/', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur userAPI.getUsers:', error);
      throw error;
    }
  },

  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    try {
      const response = await apiClient.patch(`/users/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur userAPI.updateUser:', error);
      throw error;
    }
  },

  deleteUser: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/users/${id}/`);
    } catch (error) {
      console.error('Erreur userAPI.deleteUser:', error);
      throw error;
    }
  },

  createUser: async (data: any): Promise<User> => {
    try {
      const response = await apiClient.post('/users/', data);
      return response.data;
    } catch (error) {
      console.error('Erreur userAPI.createUser:', error);
      throw error;
    }
  },

  // Mesures
  getMeasurements: async (): Promise<UserMeasurements> => {
    try {
      const response = await apiClient.get('/orders/my-measurements/');
      return response.data;
    } catch (error) {
      console.error('Erreur userAPI.getMeasurements:', error);
      throw error;
    }
  },

  saveMeasurements: async (data: UserMeasurements): Promise<any> => {
    try {
      const response = await apiClient.post('/orders/my-measurements/', data);
      return response.data;
    } catch (error) {
      console.error('Erreur userAPI.saveMeasurements:', error);
      throw error;
    }
  },

  getWorkers: () => apiClient.get('/users/workers/'),
  getApprentices: () => apiClient.get('/users/apprentices/'),

  updateApprentice: async (id: string, data: Partial<Apprentice>): Promise<Apprentice> => {
    try {
      const response = await apiClient.patch(`/users/apprentices/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur userAPI.updateApprentice:', error);
      throw error;
    }
  },

  updateWorker: async (id: string, data: Partial<Worker>): Promise<Worker> => {
    try {
      const response = await apiClient.patch(`/users/workers/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur userAPI.updateWorker:', error);
      throw error;
    }
  },
};

// Service pour les commandes
export const orderAPI = {
  getAll: async (params?: any): Promise<Order[]> => {
    try {
      const response = await apiClient.get('/orders/', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur orderAPI.getAll:', error);
      throw error;
    }
  },

  getAllAdmin: async (params?: any): Promise<Order[]> => {
    try {
      const response = await apiClient.get('/orders/admin/all/', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur orderAPI.getAllAdmin:', error);
      throw error;
    }
  },

  getById: async (orderNumber: string): Promise<Order> => {
    try {
      const response = await apiClient.get(`/orders/${orderNumber}/`);
      return response.data;
    } catch (error) {
      console.error('Erreur orderAPI.getById:', error);
      throw error;
    }
  },

  downloadInvoice: async (orderNumber: string): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/orders/${orderNumber}/invoice/`, {
        responseType: 'blob', // Important for downloading files
      });
      return response.data;
    } catch (error) {
      console.error('Erreur orderAPI.downloadInvoice:', error);
      throw error;
    }
  },

  create: async (data: any): Promise<Order> => {
    try {
      const response = await apiClient.post('/orders/create/', data);
      return response.data;
    } catch (error) {
      console.error('Erreur orderAPI.create:', error);
      throw error;
    }
  },

  updateStatus: async (id: number, status: string): Promise<Order> => {
    try {
      const response = await apiClient.patch(`/orders/${id}/`, { status: status });
      return response.data;
    } catch (error) {
      console.error('Erreur orderAPI.updateStatus:', error);
      throw error;
    }
  },

  update: async (id: number, data: any): Promise<Order> => {
    try {
      const response = await apiClient.patch(`/orders/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur orderAPI.update:', error);
      throw error;
    }
  },

  cancel: async (orderNumber: string): Promise<Order> => {
    try {
      const response = await apiClient.post(`/orders/${orderNumber}/cancel/`);
      return response.data;
    } catch (error) {
      console.error('Erreur orderAPI.cancel:', error);
      throw error;
    }
  },

  initiatePayment: async (orderNumber: string, data: { phone?: string, payment_method?: string }): Promise<any> => {
    try {
      const response = await apiClient.post(`/orders/${orderNumber}/initiate-payment/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },


};

// Service pour les annonces
export const announcementAPI = {
  getAll: async (params?: any): Promise<{ results: any[]; count: number }> => {
    try {
      const response = await apiClient.get('/communications/announcements/', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur announcementAPI.getAll:', error);
      throw error;
    }
  },

  create: async (data: any): Promise<any> => {
    try {
      const response = await apiClient.post('/communications/announcements/', data);
      return response.data;
    } catch (error) {
      console.error('Erreur announcementAPI.create:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/communications/announcements/${id}/`);
    } catch (error) {
      console.error('Erreur announcementAPI.delete:', error);
      throw error;
    }
  }
};

// Service pour les notifications
export const notificationAPI = {
  getAll: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/communications/notifications/');
      return response.data;
    } catch (error) {
      console.error('Erreur notificationAPI.getAll:', error);
      throw error;
    }
  },

  markAsRead: async (id: string): Promise<void> => {
    try {
      await apiClient.patch(`/communications/notifications/${id}/read/`);
    } catch (error) {
      console.error('Erreur notificationAPI.markAsRead:', error);
      throw error;
    }
  }
};

// Service pour le dashboard
export const dashboardAPI = {
  getStats: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/orders/dashboard/stats/');
      return response.data;
    } catch (error) {
      console.error('Erreur dashboardAPI.getStats:', error);
      throw error;
    }
  },
  getFinanceStats: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/payments/finance-stats/');
      return response.data;
    } catch (error) {
      console.error('Erreur dashboardAPI.getFinanceStats:', error);
      throw error;
    }
  }
};

export const invitationAPI = {
  create: async (data: any) => { const response = await apiClient.post('/users/group-invitations/', data); return response.data; },
  accept: async (id: string, token: string) => { const response = await apiClient.post(`/users/group-invitations/${id}/accept/`, { token }); return response.data; },
  reject: async (id: string) => { const response = await apiClient.post(`/users/group-invitations/${id}/reject/`); return response.data; },
  getAll: async () => { const response = await apiClient.get('/users/group-invitations/'); return response.data; },
};

export const journalAPI = {
  getAll: async (params?: any) => { const response = await apiClient.get('/communications/daily-journals/', { params }); return response.data; },
  create: async (data: any) => { const response = await apiClient.post('/communications/daily-journals/', data); return response.data; },
  update: async (id: string, data: any) => { const response = await apiClient.patch(`/communications/daily-journals/${id}/`, data); return response.data; },
  get: async (id: string) => { const response = await apiClient.get(`/communications/daily-journals/${id}/`); return response.data; },
};

export const groupAPI = {
  getAll: async () => { const response = await apiClient.get('/users/worker-groups/'); return response.data; },
  create: async (data: any) => { const response = await apiClient.post('/users/worker-groups/', data); return response.data; },
  addMember: async (groupId: string, userId: string) => { const response = await apiClient.post(`/users/worker-groups/${groupId}/add_member/`, { user_id: userId }); return response.data; },
  get: async (id: string) => { const response = await apiClient.get(`/users/worker-groups/${id}/`); return response.data; },
};

export const projectAPI = {
  getAll: async () => { const response = await apiClient.get('/users/worker-projects/'); return response.data; },
  create: async (data: any) => { const response = await apiClient.post('/users/worker-projects/', data); return response.data; },
  update: async (id: string, data: any) => { const response = await apiClient.patch(`/users/worker-projects/${id}/`, data); return response.data; },
  delete: async (id: string) => { const response = await apiClient.delete(`/users/worker-projects/${id}/`); return response.data; },
};

export const taskAPI = {
  getAll: async (params?: any) => { const response = await apiClient.get('/users/worker-tasks/', { params }); return response.data; },
  create: async (data: any) => { const response = await apiClient.post('/users/worker-tasks/', data); return response.data; },
  update: async (id: string, data: any) => { const response = await apiClient.patch(`/users/worker-tasks/${id}/`, data); return response.data; },
  delete: async (id: string) => { const response = await apiClient.delete(`/users/worker-tasks/${id}/`); return response.data; },
};

export const eventAPI = {
  getAll: async (params?: any) => { const response = await apiClient.get('/communications/events/', { params }); return response.data; },
  create: async (data: any) => { const response = await apiClient.post('/communications/events/', data); return response.data; },
  update: async (id: string, data: any) => { const response = await apiClient.patch(`/communications/events/${id}/`, data); return response.data; },
  delete: async (id: string) => { const response = await apiClient.delete(`/communications/events/${id}/`); return response.data; },
  get: async (id: string) => { const response = await apiClient.get(`/communications/events/${id}/`); return response.data; },
};

export const contactAPI = {
  sendMessage: async (data: ContactMessageData): Promise<any> => {
    try {
      const response = await apiClient.post('/communications/contact/', data);
      return response.data;
    } catch (error) {
      console.error('Erreur contactAPI.sendMessage:', error);
      throw error;
    }
  }
};

export const appointmentAPI = {
  getAll: async (params?: any) => {
    try {
      const response = await apiClient.get('/communications/appointments/', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur appointmentAPI.getAll:', error);
      throw error;
    }
  },
  create: async (data: { date_requested: string; reason: string }) => {
    try {
      const response = await apiClient.post('/communications/appointments/', data);
      return response.data;
    } catch (error) {
      console.error('Erreur appointmentAPI.create:', error);
      throw error;
    }
  },
  updateStatus: async (id: string, status: 'PENDING' | 'VALIDATED' | 'CANCELLED') => {
    try {
      const response = await apiClient.patch(`/communications/appointments/${id}/`, { status });
      return response.data;
    } catch (error) {
      console.error('Erreur appointmentAPI.updateStatus:', error);
      throw error;
    }
  }
};

// Fonction utilitaire pour tester la connexion API
export const testAPIConnection = async (): Promise<boolean> => {
  try {
    await apiClient.get('/');
    return true;
  } catch (error) {
    console.error('❌ Impossible de se connecter à l\'API:', error);
    return false;
  }
};

// Service pour le matériel (Inventaire)
export const inventoryAPI = {
  getMyMaterials: async (): Promise<{ data: Material[] }> => {
    try {
      const response = await apiClient.get('/inventory/materials/');
      // Adapt response to expectation (ModelViewSet returns [] or {results: []})
      // If using DefaultRouter + ModelViewSet, list returns array by default or paginated dict.
      // DRF pagination default is usually 'count', 'next', 'previous', 'results'.
      if (Array.isArray(response.data)) {
        return { data: response.data };
      }
      return { data: response.data.results || [] };
    } catch (error) {
      console.error('Erreur inventoryAPI.getMyMaterials:', error);
      throw error;
    }
  },

  addMaterial: async (data: any): Promise<Material> => {
    try {
      const response = await apiClient.post('/inventory/materials/', data);
      return response.data;
    } catch (error) {
      console.error('Erreur inventoryAPI.addMaterial:', error);
      throw error;
    }
  }
};

// Service pour les retraits
export const withdrawalAPI = {
  getAll: async (params?: any): Promise<{ results: Withdrawal[]; count: number }> => {
    try {
      const response = await apiClient.get('/payments/withdrawals/', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur withdrawalAPI.getAll:', error);
      throw error;
    }
  },

  create: async (data: { amount: number; details: string }): Promise<Withdrawal> => {
    try {
      const response = await apiClient.post('/payments/withdrawals/', data);
      return response.data;
    } catch (error) {
      console.error('Erreur withdrawalAPI.create:', error);
      throw error;
    }
  },

  update: async (id: number, data: Partial<Withdrawal>): Promise<Withdrawal> => {
    try {
      const response = await apiClient.patch(`/payments/withdrawals/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur withdrawalAPI.update:', error);
      throw error;
    }
  }
};

// Export par défaut
export default apiClient;