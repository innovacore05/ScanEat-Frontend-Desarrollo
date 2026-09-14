import { createFileRoute } from '@tanstack/react-router'
import WaiterOrders from '../../components/waiterOrders/WaiterOrders'

export const Route = createFileRoute('/(waiterOrders)/waiterOrders')({
  component: RouteComponent,
})

function RouteComponent() {
  return <WaiterOrders />
}
