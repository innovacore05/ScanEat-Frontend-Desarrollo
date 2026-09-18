


import { cookieSessionClient } from "./cookieSessionClient";


//const USERS_BASE_URL = `${import.meta.env.VITE_API_URL}/api/users`;
//cambiamos lo de arriba por esto apra que exista una relacion directra hacia el bakcned y no tenagmos problemas con el movimeinto de la scookies 
const USERS_BASE_URL = "/api/users";

export type ManagedUser = {
	userId: number;
	firstName: string;
	lastName: string;
	email: string;
	roleId: number;
};
//Borrar ya lo tiene cookiesessionclient
// type ApiError = {
// 	message?: string;
// 	[key: string]: unknown;
// };

// const getAuthHeaders = (): HeadersInit => {
// 	const token = localStorage.getItem("authToken");
// 	return token
// 		? { Authorization: `Bearer ${token}` }
// 		: {};
// };

export const getUsers = async (): Promise<ManagedUser[]> => {
	// const response = await fetch(USERS_BASE_URL, {
	// 	headers: getAuthHeaders(),
	// });
	// const data = await response.json().catch(() => []);

	// if (!response.ok) {
	// 	throw data as ApiError;
	// }
const data=await cookieSessionClient.request<
ManagedUser[] | {users? : ManagedUser[]; data? : ManagedUser[]}
>(USERS_BASE_URL,{
	method:"GET",
	fallBackMessage: "No se pudieron cargar los usuarios",
});

if (Array.isArray(data)) return data;
	return data.users ?? data.data ?? [];
	};


export const updateUser = async (
	userId: number,
	changes: Pick<ManagedUser, "firstName" | "lastName" | "email" | "roleId">,
) => {
	return cookieSessionClient.request(`${USERS_BASE_URL}/${userId}`, {

method:"PATCH",
body:JSON.stringify({
	first_name:changes.firstName,
	last_name:changes.lastName,
	email:changes.email,
	role_id:changes.roleId,
}),
fallBackMessage: "No se pudo actualizar el usuario",
});
	// const response = await fetch(`${USERS_BASE_URL}/${userId}`, {
	// 	method: "PATCH",
	// 	headers: {
	// 		"Content-Type": "application/json",
	// 		...getAuthHeaders(),
	// 	},
	// 	body: JSON.stringify({
	// 		first_name: changes.firstName,
	// 		last_name: changes.lastName,
	// 		email: changes.email,
	// 		role_id: changes.roleId,
	// 	}),
	// });
	// const data = await response.json().catch(() => ({}));

	// if (!response.ok) {
	// 	throw data as ApiError;
	// }

	// return data;
};

export const deleteUser = async (userId: number) => {
	// const response = await fetch(`${USERS_BASE_URL}/${userId}`, {
	// 	method: "DELETE",
	// 	headers: getAuthHeaders(),
	// });
	// const data = await response.json().catch(() => ({}));

	// if (!response.ok) {
	// 	throw data as ApiError;
	// }

	return cookieSessionClient.request(`${USERS_BASE_URL}/${userId}`,{method:"DELETE",
		fallBackMessage: "No se pudo eliminar el usuario",
	});
};
