import { createFileRoute } from '@tanstack/react-router'
import CookOrders from '../../components/cookOrders/cookOrders'
import { requireRole } from "../-routeGuards";

export const Route = createFileRoute('/(cookOrders)/cookOrders')({
   beforeLoad: requireRole(2),
  component: RouteComponent,
})

function RouteComponent() {
  return <CookOrders />
}
