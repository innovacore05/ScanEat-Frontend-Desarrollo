import { createFileRoute } from "@tanstack/react-router";
import VerificationCodeForm from "../../components/authentication/VerificationCodeForm";

export const Route = createFileRoute("/(authentication)/verificationCode")({
	component: VerificationCodePage,
});

function VerificationCodePage() {
	return <VerificationCodeForm />;
}