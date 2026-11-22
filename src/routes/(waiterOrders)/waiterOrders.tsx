import { createFileRoute } from '@tanstack/react-router'
import WaiterOrders from '../../components/waiterOrders/WaiterOrders'
import { requireRole } from "../-routeGuards";

export const Route = createFileRoute('/(waiterOrders)/waiterOrders')({
  beforeLoad: requireRole(3),
  component: RouteComponent,
})

function RouteComponent() {
  return <WaiterOrders />
}
