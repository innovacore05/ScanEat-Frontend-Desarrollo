import { createFileRoute } from "@tanstack/react-router";
import IssuerInformation from "../../components/issuerInformation/issuerInformation";

export const Route = createFileRoute("/(issuerInformation)/issuerInformation")({
	component: IssuerInformation,
});
