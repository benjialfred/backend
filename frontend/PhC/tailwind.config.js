/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Montserrat', 'system-ui', 'sans-serif'],
                display: ['Montserrat', 'system-ui', 'sans-serif'],
                serif: ['Newsreader', 'Playfair Display', 'Georgia', 'serif'],
            },
            colors: {
                primary: {
                    50: 'var(--color-primary-50)',
                    100: 'var(--color-primary-100)',
                    200: 'var(--color-primary-200)',
                    300: 'var(--color-primary-300)',
                    400: 'var(--color-primary-400)',
                    500: 'var(--color-primary-500)',
                    600: 'var(--color-primary-600)',
                    700: 'var(--color-primary-700)',
                    800: 'var(--color-primary-800)',
                    900: 'var(--color-primary-900)',
                    950: 'var(--color-primary-950, #1a2e05)',
                },
                accent: {
                    400: '#fcd266',
                    500: '#d4af37',
                    600: '#b8860b',
                },
                dark: {
                    DEFAULT: '#000000',
                    950: '#000000', // Pure black
                    900: '#0a0a0a', // Almost black
                    800: '#171717', // Neutral dark
                    700: '#262626',
                    600: '#404040',
                    glass: 'rgba(0, 0, 0, 0.85)',
                    'glass-light': 'rgba(255, 255, 255, 0.05)',
                },
                royal: {
                    DEFAULT: '#d4af37',
                    300: '#fcd266',
                    400: '#e5c100',
                    500: '#d4af37',
                    600: '#b8860b',
                    800: '#996515',
                    900: '#7a5210',
                    glow: 'rgba(212, 175, 55, 0.4)',
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-glow': 'conic-gradient(from 180deg at 50% 50%, #ffffff 0deg, #d4af37 180deg, #ffffff 360deg)',
                'glass-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 100%)',
            },
            animation: {
                'shimmer': 'shimmer 2.5s linear infinite',
                'float': 'float 6s ease-in-out infinite',
                'glow': 'glow 3s ease-in-out infinite alternate',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
                'slide-in': 'slideIn 0.5s ease-out forwards',
            },
            keyframes: {
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' }
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' }
                },
                glow: {
                    'from': { opacity: '0.6', filter: 'blur(10px)' },
                    'to': { opacity: '1', filter: 'blur(20px)' }
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                },
                slideIn: {
                    '0%': { opacity: '0', transform: 'translateX(-20px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' }
                }
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
                'glass-inset': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)',
                'glow-primary': '0 0 20px -5px rgba(212, 175, 55, 0.5)',
                'glow-accent': '0 0 20px -5px rgba(212, 175, 55, 0.3)',
            }
        },
    },
    plugins: [],
}
