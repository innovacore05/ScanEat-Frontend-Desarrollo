import { Link } from "@tanstack/react-router";
import { getProfile } from "../../services/authService";
import { HiArrowLeft } from "react-icons/hi";
import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";

function TablesManagment() {
	const [firstName, setFirstName] = useState("");

	useEffect(() => {
		const loadProfile = async () => {
			try {
				const data = await getProfile();
				setFirstName(data.user.firstName);
			} catch (error) {
				console.error("Error loading profile:", error);
			}
		};

		loadProfile();
	}, []);

	return (
		<DashboardLayout>
			<main className="flex min-h-screen flex-col bg-brand-white pt-8 pb-0">
				{/* Celular */}
				<section className="flex flex-1 flex-col lg:hidden">
					<div className="flex items-center gap-2">
						<Link
							to="/dashboard"
							className="flex items-center gap-2 px-8 text-brand-mint-dark"
						>
							<HiArrowLeft className="h-6 w-6" />

							<span className="text-[32px] font-bold">Mesas</span>
						</Link>
					</div>

					<div className="mt-2 flex flex-1 flex-col gap-6 rounded-t-4xl bg-neutral-50 px-6 py-8 sm:px-8">
						<div className="flex flex-col gap-4 mt-3">
							{Array.from({ length: 8 }, (_, index) => (
								<div
									key={index}
									className="h-9 rounded border color-border px-3 py-2 text-xs text-text-primary"
								>
									Mesa #{index + 10}
								</div>
							))}
						</div>

						<div className="mt-auto flex flex-col gap-4">
							<Link
								to="/editTable"
								className="mt-7 w-full cursor-pointer rounded-lg bg-brand-mint-dark px-4 py-3 text-base font-bold text-white hover:bg-brand-mint-dark/90"
							>
								<span className="font-bold text-white justify-center flex">
									Editar mesa
								</span>
							</Link>

							<Link
								to="/addTable"
								className="w-full cursor-pointer rounded-lg bg-brand-mint-dark px-4 py-3 text-base font-bold text-white hover:bg-brand-mint-dark/90"
							>
								<span className="font-bold text-white justify-center flex">
									Añadir mesa
								</span>
							</Link>
						</div>
					</div>
				</section>

				{/* Computadora */}

				<section className="hidden px-4 py-8 lg:block">
					<div className="rounded-lg bg-brand-mint-dark px-4 py-4">
						<h1 className="text-2xl font-bold text-white">
							¡Hola, {firstName || "Usuario"}!
						</h1>
					</div>

					<div className="mt-3 rounded-lg border border-pink-400 px-4 py-3">
						<p className="font-bold text-pink-500">Mesa esperando</p>
						<p className="text-xs text-text-primary">
							Mesa #1 lleva 00:00 esperando
						</p>
					</div>

					<div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-2">
						<div>
							<div className="flex items-center justify-between">
								<h2 className="text-2xl font-bold text-brand-mint-dark">
									Mesas
								</h2>

								<div className="flex gap-8">
									<Link
										to="/addTable"
										className="rounded border w-[167px] h-[34px] border-border px-3 py-2 text-xs"
									>
										Añadir mesa +
									</Link>

									<Link
										to="/editTable"
										className="rounded w-[167px] h-[34px] border border-border px-3 py-2 text-xs"
									>
										Editar mesa
									</Link>
								</div>
							</div>

							<div className="mt-4 flex flex-col gap-2">
								{Array.from({ length: 8 }, (_, index) => (
									<button
										key={index}
										type="button"
										className="rounded border border-border px-3 py-2 text-left text-xs hover:border-brand-mint-dark"
									>
										Mesa #{index + 10}
									</button>
								))}
							</div>
						</div>

						<div>
							<p className="text-xs font-bold text-text-primary">
								Detalles de mesa
							</p>

							<div className="mt-2 rounded-lg bg-brand-mint-dark px-4 py-3 text-white">
								<p className="font-bold">Mesa #10</p>
								<p className="mt-2 text-xs">Asientos: 4</p>
								<p className="text-xs">Mesero asignado: Luisa</p>
								<p className="text-xs">Zona: Segunda planta</p>
							</div>

							<div className="mt-5 rounded-lg bg-neutral-100 px-4 py-4">
								<p className="font-bold text-brand-mint-dark">
									Orden actual
								</p>

								<p className="mt-3 text-xs text-text-primary">
									Esta mesa no tiene una orden activa.
								</p>
							</div>
						</div>
					</div>
				</section>
			</main>
		</DashboardLayout>
	);
}

export default TablesManagment;
