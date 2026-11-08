import { createFileRoute } from "@tanstack/react-router";
import IssuerInformation from "../../components/issuerInformation/issuerInformation";
import { requireRole } from "../-routeGuards";

export const Route = createFileRoute("/(issuerInformation)/issuerInformation")({
	  beforeLoad: requireRole(1),
	component: IssuerInformation,
});
