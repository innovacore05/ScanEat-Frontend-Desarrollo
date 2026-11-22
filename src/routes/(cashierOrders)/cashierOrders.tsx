import { createFileRoute } from '@tanstack/react-router'
import CashierOrders from '../../components/cashierOrders/CashierOrders'
import { requireRole } from "../-routeGuards";

export const Route = createFileRoute('/(cashierOrders)/cashierOrders')({
  validateSearch: (search: Record<string, unknown>) => ({
    refresh:
      typeof search.refresh === 'string' ? search.refresh : undefined,
  }),
   beforeLoad: requireRole(4),
  component: RouteComponent,
})

function RouteComponent() {
  return <CashierOrders />
}