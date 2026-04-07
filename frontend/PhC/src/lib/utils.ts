// src/lib/utils.ts

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine les classes CSS avec clsx et les merge avec tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Formatte une date
 */
export function formatDate(date: string | Date, locale: string = 'fr-FR'): string {
    return new Date(date).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Formatte un nombre en prix
 */
export function formatPrice(price: number, currency: string = 'XAF'): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
    }).format(price);
}

/**
 * Tronque un texte
 */
export function truncateText(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Valide un email
 */
export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valide un numéro de téléphone (format international simplifié)
 */
export function validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone);
}

/**
 * Génère un ID unique
 */
export function generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Met en cache une fonction avec expiration
 */
export function cacheWithExpiry<T>(
    key: string,
    data: T,
    expiryMinutes: number = 60
): void {
    const now = new Date();
    const item = {
        value: data,
        expiry: now.getTime() + expiryMinutes * 60 * 1000,
    };
    localStorage.setItem(key, JSON.stringify(item));
}

/**
 * Récupère des données du cache
 */
export function getCachedData<T>(key: string): T | null {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    const now = new Date();

    if (now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        return null;
    }

    return item.value;
}

/**
 * Formate les tailles
 */
export function formatSize(size: string): string {
    const sizeMap: Record<string, string> = {
        XS: 'Très Petit',
        S: 'Petit',
        M: 'Moyen',
        L: 'Large',
        XL: 'Très Large',
        XXL: 'Extra Large',
        UNIQUE: 'Taille Unique',
        MULTIPLE: 'Multiples Tailles',
    };
    return sizeMap[size] || size;
}

/**
 * Formate les rôles
 */
export function formatRole(role: string): string {
    const roleMap: Record<string, string> = {
        CLIENT: 'Client',
        APPRENTI: 'Apprenti',
        WORKER: 'Worker',
        ADMIN: 'Administrateur',
        SUPER_ADMIN: 'Super Administrateur',
    };
    return roleMap[role] || role;
}

/**
 * Calculer la force du mot de passe
 */
export function calculatePasswordStrength(password: string): {
    score: number;
    strength: 'weak' | 'medium' | 'strong' | 'very-strong';
} {
    let score = 0;

    // Longueur
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 10;

    // Complexité
    if (/[A-Z]/.test(password)) score += 20;
    if (/[a-z]/.test(password)) score += 20;
    if (/[0-9]/.test(password)) score += 20;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;

    // Déterminer la force
    let strength: 'weak' | 'medium' | 'strong' | 'very-strong';
    if (score < 50) strength = 'weak';
    else if (score < 75) strength = 'medium';
    else if (score < 90) strength = 'strong';
    else strength = 'very-strong';

    return { score, strength };
}

/**
 * Formate les erreurs API en message lisible
 */
export function formatApiError(error: any): string {
    if (typeof error === 'string') return error;

    if (error.response?.data) {
        const data = error.response.data;

        // Si c'est un détail
        if (data.detail) return data.detail;

        // Si c'est un objet avec des erreurs de champ
        const fieldErrors = Object.entries(data)
            .filter(([_, value]) => Array.isArray(value))
            .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
            .join('\n');

        if (fieldErrors) return fieldErrors;

        // Si c'est un message d'erreur générique
        if (data.message) return data.message;
    }

    return 'Une erreur est survenue. Veuillez réessayer.';
}

/**
 * Télécharge un fichier
 */
export function downloadFile(content: string, fileName: string, contentType: string): void {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

/**
 * Convertit un fichier en base64
 */
export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
}

/**
 * Débounce une fonction
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Throttle une fonction
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * Animations pour les formulaires
 */

// Classe pour l'effet de brillance (shine)
export function getShineAnimation(): string {
    return `
        @keyframes shine {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        .animate-shine {
            animation: shine 1.5s ease-in-out;
        }
    `;
}

// Classe pour l'animation de secousse (shake)
export function getShakeAnimation(): string {
    return `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
            animation: shake 0.5s ease-in-out;
        }
    `;
}

// Classe pour l'animation de flottement (float)
export function getFloatAnimation(duration: number = 15): string {
    return `
        @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-10px) rotate(1deg); }
            50% { transform: translateY(-20px) rotate(0deg); }
            75% { transform: translateY(-10px) rotate(-1deg); }
        }
        .animate-float {
            animation: float ${duration}s infinite ease-in-out;
        }
        .animate-float-slow {
            animation: float ${duration * 1.5}s infinite ease-in-out;
        }
        .animate-float-fast {
            animation: float ${duration * 0.5}s infinite ease-in-out;
        }
    `;
}

// Classe pour l'animation de pulsation lente (pulse)
export function getPulseAnimation(duration: number = 4): string {
    return `
        @keyframes pulse-slow {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .animate-pulse-slow {
            animation: pulse-slow ${duration}s infinite ease-in-out;
        }
    `;
}

// Classe pour l'animation de gradient
export function getGradientAnimation(): string {
    return `
        @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .animate-gradient {
            background-size: 200% 200%;
            animation: gradient 3s ease infinite;
        }
    `;
}

// Classe pour l'animation de slide in/out
export function getSlideAnimations(): string {
    return `
        @keyframes slide-in {
            from {
                opacity: 0;
                transform: translateX(20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        @keyframes slide-out {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(-20px);
            }
        }
        .animate-slide-in {
            animation: slide-in 0.5s ease-out forwards;
        }
        .animate-slide-out {
            animation: slide-out 0.5s ease-in forwards;
        }
    `;
}

// Classe pour l'animation de fade in/out
export function getFadeAnimations(): string {
    return `
        @keyframes fade-in {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
        .animate-fade-in {
            animation: fade-in 0.6s ease-out forwards;
        }
        .animate-fade-in-slow {
            animation: fade-in 1s ease-out forwards;
        }
    `;
}

// Classe pour l'animation de gradient border
export function getGradientBorderAnimation(): string {
    return `
        @keyframes gradient-border {
            0% {
                background-position: 0% 50%;
            }
            50% {
                background-position: 100% 50%;
            }
            100% {
                background-position: 0% 50%;
            }
        }
        .animate-gradient-border {
            background: linear-gradient(45deg, 
                #7c3aed, 
                #5b21b6, 
                #8b5cf6, 
                #7c3aed
            );
            background-size: 200% 200%;
            animation: gradient-border 2s ease infinite;
        }
    `;
}

// Classe pour l'animation de rotation infinie
export function getSpinAnimation(): string {
    return `
        @keyframes spin {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }
        .animate-spin {
            animation: spin 1s linear infinite;
        }
    `;
}

// Classe pour l'animation de bounce
export function getBounceAnimation(): string {
    return `
        @keyframes bounce {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-10px);
            }
        }
        .animate-bounce {
            animation: bounce 2s infinite ease-in-out;
        }
    `;
}

// Fonction pour initialiser toutes les animations
export function initAnimations(): string {
    return `
        ${getShineAnimation()}
        ${getShakeAnimation()}
        ${getFloatAnimation()}
        ${getPulseAnimation()}
        ${getGradientAnimation()}
        ${getSlideAnimations()}
        ${getFadeAnimations()}
        ${getGradientBorderAnimation()}
        ${getSpinAnimation()}
        ${getBounceAnimation()}
    `;
}

/**
 * Fonction utilitaire pour appliquer des animations conditionnelles
 */
export function getAnimationClasses(
    animationType: 'float' | 'pulse' | 'slide' | 'fade' | 'gradient' | 'spin' | 'bounce',
    speed: 'slow' | 'normal' | 'fast' = 'normal'
): string {
    const baseClasses = {
        float: 'animate-float',
        pulse: 'animate-pulse-slow',
        slide: 'animate-slide-in',
        fade: 'animate-fade-in',
        gradient: 'animate-gradient',
        spin: 'animate-spin',
        bounce: 'animate-bounce',
    };

    const speedClasses = {
        slow: '-slow',
        normal: '',
        fast: '-fast',
    };

    return `${baseClasses[animationType]}${speedClasses[speed]}`;
}

/**
 * Fonction pour créer un dégradé CSS
 */
export function createGradient(
    colors: string[],
    direction: 'to right' | 'to left' | 'to bottom' | 'to top' | 'to bottom right' | 'to top left' = 'to right',
    type: 'linear' | 'radial' = 'linear'
): string {
    if (type === 'radial') {
        return `radial-gradient(circle, ${colors.join(', ')})`;
    }
    return `linear-gradient(${direction}, ${colors.join(', ')})`;
}

/**
 * Fonction pour créer une ombre portée avec dégradé
 */
export function createShadow(
    color: string = 'rgba(124, 58, 237, 0.1)',
    intensity: 'light' | 'medium' | 'strong' = 'medium'
): string {
    const intensities = {
        light: '0 4px 6px',
        medium: '0 10px 25px',
        strong: '0 20px 40px',
    };
    return `${intensities[intensity]} ${color}`;
}

/**
 * Fonction pour créer un effet de verre (glass morphism)
 */
export function createGlassEffect(
    blur: 'sm' | 'md' | 'lg' | 'xl' = 'md',
    opacity: number = 0.8
): string {
    const blurs = {
        sm: 'blur-sm',
        md: 'blur-md',
        lg: 'blur-lg',
        xl: 'blur-xl',
    };
    return `backdrop-filter: ${blurs[blur]}; background: rgba(255, 255, 255, ${opacity});`;
}

/**
 * Fonction pour valider un mot de passe selon les exigences
 */
export function validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Le mot de passe doit contenir au moins une majuscule');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Le mot de passe doit contenir au moins un chiffre');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Fonction pour vérifier si un email est disponible (simulation)
 */
export async function checkEmailAvailability(email: string): Promise<boolean> {
    // Cette fonction simule une vérification d'email
    // Dans la vraie application, elle appellerait votre API
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simuler un email déjà utilisé
            const fakeUsedEmails = ['existant@email.com', 'test@test.com'];
            resolve(!fakeUsedEmails.includes(email));
        }, 500);
    });
}

/**
 * Fonction pour générer un avatar par défaut
 */
export function generateAvatar(name: string, size: number = 40): string {
    const initials = name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    // Créer un SVG d'avatar
    const svg = `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#7c3aed" />
                    <stop offset="100%" stop-color="#5b21b6" />
                </linearGradient>
            </defs>
            <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size / 2}" />
            <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" 
                  font-family="Arial, sans-serif" font-size="${size / 2.5}" font-weight="bold">
                ${initials}
            </text>
        </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
}