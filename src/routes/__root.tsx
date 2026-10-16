import {
    Outlet,
    createRootRoute,
} from "@tanstack/react-router";
import AuthSessionSync from "../components/authentication/AuthSessionSync";
import { ThemeProvider } from "../contexts/ThemeContext";
import CartOrderNavigation from "../components/clientOrders/CartOrderNavigation";

function RootComponent() {
    return (
        <ThemeProvider>
            <AuthSessionSync />
            <CartOrderNavigation />
            <div className="route-transition">
                <Outlet />
            </div>
        </ThemeProvider>
    );
}

export const Route = createRootRoute({
    component: RootComponent,
});