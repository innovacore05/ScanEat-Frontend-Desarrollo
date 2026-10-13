import { createFileRoute } from '@tanstack/react-router'
import DashboardAdmin from '../../components/dashboard/DashboardAdmin'

export const Route = createFileRoute('/(dashboard)/dashboardAdmin')({
  component: RouteComponent,
})

function RouteComponent() {
  return <DashboardAdmin />
}
