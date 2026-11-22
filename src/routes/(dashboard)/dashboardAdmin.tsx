import { createFileRoute } from '@tanstack/react-router'
import DashboardAdmin from '../../components/dashboard/DashboardAdmin'
import { requireRole } from "../-routeGuards";

export const Route = createFileRoute('/(dashboard)/dashboardAdmin')({
   beforeLoad: requireRole(1),
  component: RouteComponent,
})

function RouteComponent() {
  return <DashboardAdmin />
}
