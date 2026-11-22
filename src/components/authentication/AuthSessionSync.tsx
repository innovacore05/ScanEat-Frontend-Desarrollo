import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

import { getProfile } from "../../services/authService";
import { getDashboardForRole } from "../../config/roles";

export default function AuthSessionSync() {
  const navigate = useNavigate();
  const isCustomerRoute = (path: string) =>
    [
      "/menuClient",
      "/checkOrder",
      "/orderStatus",
      "/reviewPlate",
      "/reviews",
      "/invalidTableScreen",
    ].some((route) => path.startsWith(route));

  useEffect(() => {
    const handleStorageChange = async (event: StorageEvent) => {
      if (event.key !== "authUser") {
        return;
      }

      if (event.key !== "authUser") {
        return;
      }

      if (isCustomerRoute(window.location.pathname)) {
        return;
      }
      try {
        const profile = await getProfile();

        const currentPath = window.location.pathname;
        const dashboard = getDashboardForRole(profile.user.roleId);

        const isWaiterRoute = currentPath.startsWith("/dashboardWaiter");

        const isDashboardRoute = currentPath.startsWith("/dashboard");

        const shouldRedirect =
          (profile.user.roleId === 3 && isDashboardRoute && !isWaiterRoute) ||
          (profile.user.roleId !== 3 && isWaiterRoute);

        if (shouldRedirect) {
          navigate({ to: dashboard });
        }
      } catch (error) {
        console.error(
          "La sesión cambió y no se pudo obtener el perfil:",
          error,
        );

        if (!isCustomerRoute(window.location.pathname)) {
          navigate({ to: "/login" });
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate]);

  return null;
}

//actualziacion front
