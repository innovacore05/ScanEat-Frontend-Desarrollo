export const ROLE_IDS = {
	owner: 1,
	cook: 2,
	waiter: 3,
} as const;

export function getDashboardForRole(
	roleId: number,
): "/dashboard" | "/dashboardCook" | "/dashboardWaiter" {
	switch (roleId) {
		case ROLE_IDS.cook:
			return "/dashboardCook";
		case ROLE_IDS.waiter:
			return "/dashboardWaiter";
		case ROLE_IDS.owner:
			return "/dashboard";
		default:
			throw new Error(`Rol no soportado: ${roleId}`);
	}
}
