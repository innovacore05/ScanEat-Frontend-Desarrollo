import { createFileRoute } from '@tanstack/react-router'
import Review from '../../components/reviewClient/Review'

export const Route = createFileRoute('/(menuClient)/reviews')({
  validateSearch: (search) => ({
    mesaId: typeof search.mesaId === 'string' ? search.mesaId : undefined,
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return <Review/>
}