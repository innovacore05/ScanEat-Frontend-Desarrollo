import { createFileRoute } from '@tanstack/react-router'
import ForgotPasswordForm from '../../components/authentication/ForgotPasswordForm'

export const Route = createFileRoute('/(authentication)/forgotPassword')({
    component: RouteComponent,
})

function RouteComponent() {
    return <ForgotPasswordForm />;
}
