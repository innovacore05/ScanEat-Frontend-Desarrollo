import {
    Outlet,
    createRootRoute,
} from "@tanstack/react-router";
import AuthSessionSync from "../components/authentication/AuthSessionSync";
import { ThemeProvider } from "../contexts/ThemeContext";

function RootComponent() {
    return (
        <ThemeProvider>
            <AuthSessionSync />
            <div className="route-transition">
                <Outlet />
            </div>
        </ThemeProvider>
    );
}

export const Route = createRootRoute({
    component: RootComponent,
});