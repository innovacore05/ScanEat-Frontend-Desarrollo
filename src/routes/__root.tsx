import { Outlet, createRootRoute } from "@tanstack/react-router";
import AuthSessionSync from "../components/authentication/AuthSessionSync";

function rootComponent(){
    return(
        <>
        <AuthSessionSync/>
        <Outlet/>
        </>
    );
}

export const Route = createRootRoute({
    component: rootComponent,
});