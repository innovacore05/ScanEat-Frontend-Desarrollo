import { createFileRoute } from "@tanstack/react-router";
import AccountSuccessForm from "../../components/authentication/AccountSuccessForm";

export const Route = createFileRoute("/(authentication)/accountSuccess")({
	component: AccountSuccessPage,
});

function AccountSuccessPage() {
	return <AccountSuccessForm />;
}