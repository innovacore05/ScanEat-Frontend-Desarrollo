
import { redirect } from "@tanstack/react-router";
import { getProfile } from "../services/authService";
import { getDashboardForRole } from "../config/roles";

export const requireRole = (...allowedRoles: number[]) => async () => {
    let roleId: number;

    try {
        const profile = await getProfile();
        roleId = profile.user.roleId;
    } catch {
        throw redirect({
            to: "/login",
        });
    }

    let userDashboard: ReturnType<typeof getDashboardForRole>;

    try {
        userDashboard = getDashboardForRole(roleId);
    } catch {
        throw redirect({
            to: "/login",
        });
    }

    if (!allowedRoles.includes(roleId)) {
        throw redirect({
            to: userDashboard,
        });
    }
};
