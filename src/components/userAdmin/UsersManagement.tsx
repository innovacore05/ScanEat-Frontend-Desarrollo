import { useEffect, useState } from "react";
import { HiArrowLeft } from "react-icons/hi";
import { Link } from "@tanstack/react-router";
import DashboardLayout from "../layout/DashboardLayout";
import { getProfile } from "../../services/authService";
import { ROLE_IDS } from "../../config/roles";
import {deleteUser,getUsers,type ManagedUser,updateUser,} from "../../services/userService";
import UserCard from "./UserCard";

function UsersManagement() {
	const [firstName, setFirstName] = useState("");
	const [users, setUsers] = useState<ManagedUser[]>([]);
	const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
	const [userToDelete, setUserToDelete] = useState<ManagedUser | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState("");
	const [form, setForm] = useState<{ firstName: string; lastName: string; email: string; roleId: number }>({
		firstName: "",
		lastName: "",
		email: "",
		roleId: ROLE_IDS.waiter,
	});

	useEffect(() => {
		const loadProfile = async () => {
			try {
				const data = await getProfile();
				setFirstName(data.user.firstName);
			} catch (profileError) {
				console.error("Error cargando el perfil:", profileError);
			}
		};

		const loadUsers = async () => {
			try {
				setUsers((await getUsers()).filter((user) => user.roleId === ROLE_IDS.cook || user.roleId === ROLE_IDS.waiter));
			} catch (loadError) {
				console.error("Error cargando usuarios:", loadError);
				setError("No se pudieron cargar los usuarios.");
			} finally {
				setIsLoading(false);
			}
		};

		loadProfile();
		loadUsers();
	}, []);

	const openEdit = (user: ManagedUser) => {
		setSelectedUser(user);
		setForm({
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			roleId: user.roleId,
		});
		setError("");
	};

	const handleSave = async (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!selectedUser || !form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
			setError("Completa todos los campos.");
			return;
		}

		try {
			setIsSaving(true);
			await updateUser(selectedUser.userId, {
				firstName: form.firstName.trim(),
				lastName: form.lastName.trim(),
				email: form.email.trim(),
				roleId: form.roleId,
			});
			setUsers((current) =>
				current.map((user) =>
					user.userId === selectedUser.userId
						? { ...user, ...form, firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim() }
						: user,
				),
			);
			setSelectedUser(null);
		} catch (saveError) {
			console.error("Error actualizando usuario:", saveError);
			setError("No se pudo actualizar el usuario.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!userToDelete) return;
		try {
			setIsDeleting(true);
			await deleteUser(userToDelete.userId);
			setUsers((current) => current.filter((user) => user.userId !== userToDelete.userId));
			if (selectedUser?.userId === userToDelete.userId) setSelectedUser(null);
			setUserToDelete(null);
		} catch (deleteError) {
			console.error("Error eliminando usuario:", deleteError);
			setError("No se pudo eliminar el usuario.");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<DashboardLayout>
			<section className="px-8 py-8 lg:px-15 lg:pt-15 lg:pb-0 hidden lg:block">
				<div className="rounded-2xl bg-mint-dark px-8 py-6">
						<h1 className="text-3xl font-bold text-white">
							¡Hola, {firstName || "Usuario"}!
						</h1>
					</div>
			</section>
			<main className="min-h-screen bg-white px-4 py-6 sm:px-6 sm:py-8 lg:px-15 lg:pt-4 lg:pb-15">
				
				<div className="w-full">
					<Link to="/dashboard" className="mb-1 flex items-center gap-2 text-mint-dark lg:hidden">
						<HiArrowLeft className="h-6 w-6" />
						<span className="text-[32px] font-bold">Gestión de personal</span>
					</Link>
					<h2 className="hidden lg:block text-2xl font-bold text-mint-darker lg:text-3xl">Gestión de personal</h2>
					{error && <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
					{isLoading && <p className="mt-8 text-text-primary">Cargando usuarios...</p>}
					{!isLoading && users.length === 0 && <p className="mt-8 text-text-primary">No hay personal registrado.</p>}
					<div className="max-w-5xl">
						<div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 md:grid-cols-2">
							{users.map((user) => (
								<UserCard key={user.userId} user={user} onEdit={openEdit} onDelete={setUserToDelete} />
							))}
						</div>
					</div>
				</div>

				{selectedUser && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
						<form onSubmit={handleSave} className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6">
							<h2 className="text-xl font-bold text-mint-darker">Editar usuario</h2>
							<div className="mt-5 flex flex-col gap-3">
								<input className="rounded-lg border border-border px-4 py-3" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} placeholder="Nombre" />
								<input className="rounded-lg border border-border px-4 py-3" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} placeholder="Apellidos" />
								<input className="rounded-lg border border-border px-4 py-3" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Correo electrónico" />
								<select className="rounded-lg border border-border px-4 py-3" value={form.roleId} onChange={(event) => setForm({ ...form, roleId: Number(event.target.value) })}>
									<option value={ROLE_IDS.waiter}>Mesero</option>
									<option value={ROLE_IDS.cook}>Cocinero</option>
								</select>
							</div>
							<div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
								<button type="button" onClick={() => setSelectedUser(null)} disabled={isSaving || isDeleting} className="rounded-lg px-4 py-3 text-text-primary hover:bg-neutral-100 sm:py-2">Cancelar</button>
								<button type="submit" disabled={isSaving || isDeleting} className="rounded-lg bg-mint-dark px-4 py-3 font-bold text-white disabled:opacity-60 sm:py-2">{isSaving ? "Guardando..." : "Guardar"}</button>
							</div>
						</form>
					</div>
				)}

				{userToDelete && (
					<div
						className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
						role="dialog"
						aria-modal="true"
						aria-labelledby="delete-user-dialog-title"
					>
						<div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
							<h2 id="delete-user-dialog-title" className="text-lg font-bold text-mint-darker">
								¿Eliminar usuario?
							</h2>
							<p className="mt-2 text-sm text-text-primary">
								¿Deseas eliminar a{" "}
								<strong>{userToDelete.firstName} {userToDelete.lastName}</strong>? Esta acción no se puede deshacer.
							</p>
							<div className="mt-6 flex justify-end gap-3">
								<button
									type="button"
									onClick={() => setUserToDelete(null)}
									disabled={isDeleting}
									className="cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-text-primary hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
								>
									Cancelar
								</button>
								<button
									type="button"
									onClick={handleDelete}
									disabled={isDeleting}
									className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
								>
									{isDeleting ? "Eliminando..." : "Eliminar"}
								</button>
							</div>
						</div>
					</div>
				)}
			</main>
		</DashboardLayout>
	);
}

export default UsersManagement;
