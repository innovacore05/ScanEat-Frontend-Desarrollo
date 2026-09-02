import { createFileRoute } from '@tanstack/react-router'
import DashboardWaiter from '../../components/dashboard/DashboardWaiter'

export const Route = createFileRoute('/(dashboard)/dashboardWaiter')({
  component: RouteComponent,
})

function RouteComponent() {
  return <DashboardWaiter />
}
