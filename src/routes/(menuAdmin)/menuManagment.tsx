import { createFileRoute } from '@tanstack/react-router'
import MenuManagment from '../../components/menuAdmin/MenuManagment'
import { requireRole } from "../-routeGuards";

export const Route = createFileRoute('/(menuAdmin)/menuManagment')({
  beforeLoad: requireRole(1),
  component: RouteComponent,
})

function RouteComponent() {
  return <MenuManagment />
}
