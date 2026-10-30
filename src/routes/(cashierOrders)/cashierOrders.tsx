import { createFileRoute } from '@tanstack/react-router'
import CashierOrders from '../../components/cashierOrders/CashierOrders'

export const Route = createFileRoute('/(cashierOrders)/cashierOrders')({
  validateSearch: (search: Record<string, unknown>) => ({
    refresh:
      typeof search.refresh === 'string' ? search.refresh : undefined,
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return <CashierOrders />
}