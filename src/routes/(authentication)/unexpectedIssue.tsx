import { createFileRoute } from "@tanstack/react-router";
import UnexpectedIssueForm from "../../components/authentication/UnexpectedIssueForm";

export const Route = createFileRoute("/(authentication)/unexpectedIssue")({
	component: UnexpectedIssuePage,
});

function UnexpectedIssuePage() {
	return <UnexpectedIssueForm />;
}