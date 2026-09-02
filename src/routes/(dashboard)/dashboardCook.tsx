import { createFileRoute } from '@tanstack/react-router'
import DashboardCook from '../../components/dashboard/DashboardCook'

export const Route = createFileRoute('/(dashboard)/dashboardCook')({
  component: RouteComponent,
})

function RouteComponent() {
  return <DashboardCook />
}
