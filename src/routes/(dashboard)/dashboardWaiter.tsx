import { createFileRoute } from '@tanstack/react-router'
import DashboardWaiter from '../../components/dashboard/DashboardWaiter'
import { requireRole } from "../-routeGuards";

export const Route = createFileRoute('/(dashboard)/dashboardWaiter')({
   beforeLoad: requireRole(3),
  component: RouteComponent,
})

function RouteComponent() {
  return <DashboardWaiter />
}
