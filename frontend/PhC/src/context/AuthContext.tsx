import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '@/services/api';
import type { User } from '@/types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: () => { },
    logout: () => { },
    updateUser: () => { },
});

export const useAuth = () => useContext(AuthContext);

// ==========================================
// FOURNISSEUR D'ÉTAT (AUTH PROVIDER)
// ==========================================
// Ce composant enveloppe l'application entière (dans main.tsx) pour rendre
// l'état de l'utilisateur disponible partout, évitant le "prop drilling" (passer
// les props de composant en composant).
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Au chargement initial de l'application, on vérifie si l'utilisateur
        // a déjà une session valide (token valide en localStorage).
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('access_token'); // Changed from 'token' to 'access_token' to match api.ts
        const storedUser = localStorage.getItem('user');

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        if (token) {
            try {
                const userData = await authAPI.getProfile();
                setUser(userData);
                // Update local storage with fresh data
                localStorage.setItem('user', JSON.stringify(userData));
            } catch (error) {
                console.error('Session expiré ou token invalide', error);
                // Si getProfile échoue même après les retentatives anonymes de l'intercepteur, 
                // cela signifie que le token est définitivement mort. Nettoyons tout !
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                setUser(null);
            }
        }
        setLoading(false);
    };
    const login = (token: string, userData: User) => {
        // Lors d'une connexion réussie, on sauvegarde tout localement
        // pour persister la session même en cas de rafraîchissement F5 de la page.
        localStorage.setItem('access_token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        // Redirection basée sur le rôle
        const dashboardRoles = ['ADMIN', 'SUPER_ADMIN', 'WORKER', 'APPRENTI'];
        if (dashboardRoles.includes(userData.role)) {
            navigate('/dashboard');
        } else {
            // Pour les clients, redirection vers la boutique ou le profil
            navigate('/');
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    const updateUser = (userData: User) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
