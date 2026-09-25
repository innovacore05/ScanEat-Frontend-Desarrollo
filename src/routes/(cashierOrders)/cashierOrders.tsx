import { createFileRoute } from '@tanstack/react-router'
import CashierOrders from '../../components/cashierOrders/CashierOrders'

export const Route = createFileRoute('/(cashierOrders)/cashierOrders')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CashierOrders />
}