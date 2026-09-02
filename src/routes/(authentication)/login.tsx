import { createFileRoute } from "@tanstack/react-router";
import LoginForm from "../../components/authentication/LoginForm";

export const Route = createFileRoute("/(authentication)/login")({
    component: LoginPage,
});

function LoginPage() {
    return <LoginForm />;
}