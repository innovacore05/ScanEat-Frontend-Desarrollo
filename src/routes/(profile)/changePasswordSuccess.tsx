import { createFileRoute } from "@tanstack/react-router";
import ChangePasswordSuccessForm from "../../components/profile/ChangePasswordForm";

export const Route = createFileRoute("/(profile)/changePasswordSuccess")({
	component: ChangePasswordSuccessPage,
});

function ChangePasswordSuccessPage() {
	return <ChangePasswordSuccessForm />;
}