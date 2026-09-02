import { createFileRoute } from "@tanstack/react-router";
import ProfileSettingsForm from "../../components/profile/ProfileSettingsForm";

export const Route = createFileRoute("/(profile)/profileSettings")({
	component: ProfileSettingsPage,
});

function ProfileSettingsPage() {
	return <ProfileSettingsForm />;
}