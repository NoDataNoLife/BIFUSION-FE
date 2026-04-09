import { useEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'bifusion-theme';

function getInitialTheme() {
    if (typeof window === 'undefined') {
        return false;
    }

    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (storedTheme === 'dark') {
        return true;
    }

    if (storedTheme === 'light') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useThemeMode() {
    const [isDark, setIsDark] = useState(getInitialTheme);

    useEffect(() => {
        const root = document.documentElement;

        if (isDark) {
            root.classList.add('dark');
            window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
        } else {
            root.classList.remove('dark');
            window.localStorage.setItem(THEME_STORAGE_KEY, 'light');
        }
    }, [isDark]);

    return {
        isDark,
        toggleTheme: () => setIsDark((current) => !current),
    };
}