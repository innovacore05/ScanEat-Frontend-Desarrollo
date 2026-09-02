import { createFileRoute } from "@tanstack/react-router";
import PasswordSuccessForm from "../../components/authentication/PasswordSuccessForm";

export const Route = createFileRoute("/(authentication)/passwordSuccess")({
	component: PasswordSuccessPage,
});

function PasswordSuccessPage() {
	return <PasswordSuccessForm />;
}