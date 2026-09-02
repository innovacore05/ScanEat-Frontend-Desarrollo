import { createFileRoute } from "@tanstack/react-router";
import RegisterForm from "../../components/authentication/RegisterForm";

export const Route = createFileRoute("/(authentication)/register")({
	component: RegisterPage,
});

function RegisterPage() {
	return <RegisterForm />;
}