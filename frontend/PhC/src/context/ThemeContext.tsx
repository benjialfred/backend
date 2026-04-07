import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ColorTheme = 'orange' | 'blue' | 'green' | 'purple' | 'red';

interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: Theme;
    defaultColorTheme?: ColorTheme;
    storageKey?: string;
}

interface ThemeProviderState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    colorTheme: ColorTheme;
    setColorTheme: (theme: ColorTheme) => void;
}

const initialState: ThemeProviderState = {
    theme: 'system',
    setTheme: () => null,
    colorTheme: 'orange',
    setColorTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
    children,
    defaultTheme = 'system',
    defaultColorTheme = 'orange',
    storageKey = 'vite-ui-theme',
    colorStorageKey = 'vite-ui-color-theme',
}: ThemeProviderProps & { colorStorageKey?: string }) {
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
    );

    const [colorTheme, setColorTheme] = useState<ColorTheme>(
        () => (localStorage.getItem(colorStorageKey) as ColorTheme) || defaultColorTheme
    );

    useEffect(() => {
        const root = window.document.documentElement;

        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
                .matches
                ? 'dark'
                : 'light';

            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme);
        }
    }, [theme]);

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove all previous theme classes
        root.classList.remove('theme-orange', 'theme-blue', 'theme-green', 'theme-purple', 'theme-red');

        // Add new theme class (unless it's default orange which might be base)
        if (colorTheme !== 'orange') {
            root.classList.add(`theme-${colorTheme}`);
        }
    }, [colorTheme]);

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme);
            setTheme(theme);
        },
        colorTheme,
        setColorTheme: (theme: ColorTheme) => {
            localStorage.setItem(colorStorageKey, theme);
            setColorTheme(theme);
        }
    };

    return (
        <ThemeProviderContext.Provider value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    if (context === undefined)
        throw new Error('useTheme must be used within a ThemeProvider');

    return context;
};
