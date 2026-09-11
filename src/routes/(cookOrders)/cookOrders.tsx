import { createFileRoute } from '@tanstack/react-router'
import CookOrders from '../../components/cookOrders/cookOrders'

export const Route = createFileRoute('/(cookOrders)/cookOrders')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CookOrders />
}
