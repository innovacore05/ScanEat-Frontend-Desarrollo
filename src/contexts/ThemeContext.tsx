import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { getProfile } from "../services/authService";
import {
    DEFAULT_THEME,
    type ThemeFormValues,
} from "../config/restaurantTheme";
import {
    getRestaurantTheme,
    getThemeByTable,
    updateRestaurantTheme,
} from "../services/themeService";
import {
    useLocation,
} from "@tanstack/react-router";

interface ThemeContextValue {
    theme: ThemeFormValues;
    isLoading: boolean;
    saveTheme: (
        theme: ThemeFormValues,
    ) => Promise<void>;
    reloadTheme: () => Promise<void>;
}

const ThemeContext =
    createContext<ThemeContextValue | null>(null);

function applyTheme(theme: ThemeFormValues) {
    const root = document.documentElement;

    root.style.setProperty(
        "--color-mint-dark",
        theme.primaryColor,
    );

    root.style.setProperty(
        "--color-mint-darker",
        theme.secondaryColor,
    );

    root.style.setProperty(
        "--restaurant-font",
        `"${theme.fontFamily}"`,
    );
}

function ThemeLoadingScreen() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-white">
            <p className="text-text-primary">
                Cargando...
            </p>
        </main>
    );
}

export function ThemeProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [theme, setTheme] =
        useState<ThemeFormValues>(DEFAULT_THEME);
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);

    async function reloadTheme() {
        setIsLoading(true);

        try {
            if (isAuthenticationRoute(location.pathname)) {
                setTheme(DEFAULT_THEME);
                applyDefaultTheme();
                return;
            }

            const tableId = getTableIdFromUrl();

            if (tableId) {
                const savedTheme =
                    await getThemeByTable(tableId);

                const nextTheme: ThemeFormValues = {
                    primaryColor: savedTheme.primaryColor,
                    secondaryColor: savedTheme.secondaryColor,
                    fontFamily: savedTheme.fontFamily,
                    logoUrl: savedTheme.logoUrl,
                };

                setTheme(nextTheme);
                applyTheme(nextTheme);
                return;
            }

            const profile = await getProfile();
            const businessId = profile.business?.businessId;

            if (!businessId) {
                setTheme(DEFAULT_THEME);
                applyTheme(DEFAULT_THEME);
                return;
            }

            const savedTheme =
                await getRestaurantTheme(businessId);

            const nextTheme: ThemeFormValues = {
                primaryColor: savedTheme.primaryColor,
                secondaryColor: savedTheme.secondaryColor,
                fontFamily: savedTheme.fontFamily,
                logoUrl: savedTheme.logoUrl,
            };

            setTheme(nextTheme);
            applyTheme(nextTheme);
        } catch (error) {
            console.error(
                "No se pudo cargar la personalización:",
                error,
            );

            setTheme(DEFAULT_THEME);
            applyTheme(DEFAULT_THEME);
        } finally {
            setIsLoading(false);
        }
    }

    async function saveTheme(
        nextTheme: ThemeFormValues,
    ) {
        const profile = await getProfile();
        const businessId = profile.business?.businessId;

        if (!businessId) {
            throw new Error(
                "No se encontró el restaurante",
            );
        }

        const savedTheme =
            await updateRestaurantTheme(
                businessId,
                nextTheme,
            );

        const updatedTheme: ThemeFormValues = {
            primaryColor: savedTheme.primaryColor,
            secondaryColor: savedTheme.secondaryColor,
            fontFamily: savedTheme.fontFamily,
            logoUrl: savedTheme.logoUrl,
        };

        setTheme(updatedTheme);
        applyTheme(updatedTheme);
    }

    useEffect(() => {
        void reloadTheme();
    }, [
        location.pathname,
        JSON.stringify(location.search),
    ]);

    if (isLoading) {
        return <ThemeLoadingScreen />;
    }

    return (
        <ThemeContext.Provider
            value={{
                theme,
                isLoading,
                saveTheme,
                reloadTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

function getTableIdFromUrl() {
    const params = new URLSearchParams(
        window.location.search,
    );

    const isClientRoute = [
        "/menuClient",
        "/checkOrder",
        "/orderStatus",
        "/reviewPlate",
    ].some((route) =>
        window.location.pathname.startsWith(route),
    );

    if (!isClientRoute) {
        return null;
    }

    return (
        params.get("mesaId") ??
        params.get("tableId")
    );
}
export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error(
            "useTheme debe utilizarse dentro de ThemeProvider",
        );
    }

    return context;
}

function isAuthenticationRoute(pathname: string) {
    return [
        "/login",
        "/register",
        "/registerBusiness",
        "/forgotPassword",
        "/resetPassword",
        "/accountVerification",
        "/verificationCode",
    ].some((route) => pathname.startsWith(route));
}

function applyDefaultTheme() {
    const root = document.documentElement;

    root.style.setProperty(
        "--color-mint-dark",
        DEFAULT_THEME.primaryColor,
    );

    root.style.setProperty(
        "--color-mint-darker",
        DEFAULT_THEME.secondaryColor,
    );

    root.style.setProperty(
        "--restaurant-font",
        `"${DEFAULT_THEME.fontFamily}"`,
    );
}