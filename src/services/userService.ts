const USERS_BASE_URL = `${import.meta.env.VITE_API_URL}/api/users`;

export type ManagedUser = {
	userId: number;
	firstName: string;
	lastName: string;
	email: string;
	roleId: number;
};

type ApiError = {
	message?: string;
	[key: string]: unknown;
};

const getAuthHeaders = (): HeadersInit => {
	const token = localStorage.getItem("authToken");
	return token
		? { Authorization: `Bearer ${token}` }
		: {};
};

export const getUsers = async (): Promise<ManagedUser[]> => {
	const response = await fetch(USERS_BASE_URL, {
		headers: getAuthHeaders(),
	});
	const data = await response.json().catch(() => []);

	if (!response.ok) {
		throw data as ApiError;
	}

	return (Array.isArray(data) ? data : data.users ?? data.data ?? []) as ManagedUser[];
};

export const updateUser = async (
	userId: number,
	changes: Pick<ManagedUser, "firstName" | "lastName" | "email" | "roleId">,
) => {
	const response = await fetch(`${USERS_BASE_URL}/${userId}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
			...getAuthHeaders(),
		},
		body: JSON.stringify({
			first_name: changes.firstName,
			last_name: changes.lastName,
			email: changes.email,
			role_id: changes.roleId,
		}),
	});
	const data = await response.json().catch(() => ({}));

	if (!response.ok) {
		throw data as ApiError;
	}

	return data;
};

export const deleteUser = async (userId: number) => {
	const response = await fetch(`${USERS_BASE_URL}/${userId}`, {
		method: "DELETE",
		headers: getAuthHeaders(),
	});
	const data = await response.json().catch(() => ({}));

	if (!response.ok) {
		throw data as ApiError;
	}

	return data;
};
