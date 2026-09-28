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
            <Outlet />
        </ThemeProvider>
    );
}

export const Route = createRootRoute({
    component: RootComponent,
});