import { createFileRoute } from "@tanstack/react-router";
import AccountVerificationForm from "../../components/authentication/AccountVerificationForm";

export const Route = createFileRoute("/(authentication)/accountVerification")({
    validateSearch: (search) => ({
        email: String(search.email ?? ""),
    }),
	component: AccountVerificationPage,
});

function AccountVerificationPage() {
	return <AccountVerificationForm />;
}