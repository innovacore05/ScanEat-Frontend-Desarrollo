export const ROLE_IDS = {
	owner: 1,
	cook: 2,
	waiter: 3,
	cashier: 4,
} as const;

export function getDashboardForRole(
	roleId: number,
): "/dashboard" | "/cookOrders" | "/dashboardWaiter" | "/cashierOrders" {
	switch (roleId) {
		case ROLE_IDS.cook:
			return "/cookOrders";
		case ROLE_IDS.waiter:
			return "/dashboardWaiter";
		case ROLE_IDS.cashier:
			return "/cashierOrders";
		case ROLE_IDS.owner:
			return "/dashboard";

		default:
			throw new Error(`Rol no soportado: ${roleId}`);
	}
}
