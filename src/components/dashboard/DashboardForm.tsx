import { useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaRegCircleUser } from "react-icons/fa6";
import { RiSettingsLine } from "react-icons/ri";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { RiNotification2Line } from "react-icons/ri";
import { LuLogOut } from "react-icons/lu";
import { GoHome } from "react-icons/go";
import { IoRestaurantOutline } from "react-icons/io5";
import { LuShoppingBag } from "react-icons/lu";
import { Link } from "@tanstack/react-router";

function DashboardForm() {
	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	return (
		<main className="min-h-screen bg-white px-6 py-8">

			<div className="flex justify-start">
				<img
					src="/img/logoS.png"
					alt="Logo del negocio"
				/>
			</div>

			<div className="mt-8 flex items-center justify-between">
				<button
					type="button"
					onClick={() => setIsMenuOpen(!isMenuOpen)}
					className="cursor-pointer text-brand-mint-dark"
					aria-label="Abrir menú"
				>
					<GiHamburgerMenu className="h-8 w-8" />
				</button>

				<button
					type="button"
					onClick={() =>
						setIsProfileMenuOpen(!isProfileMenuOpen)
					}
					className="cursor-pointer text-brand-mint-dark"
					aria-label="Abrir perfil"
				>
					<FaRegCircleUser className="h-8 w-8" />
				</button>
			</div>

			{/* Menú lateral izquierdo */}
			{isMenuOpen && (
				<>
					<button
						type="button"
						aria-label="Cerrar menú"
						onClick={() => setIsMenuOpen(false)}
						className="fixed inset-0 z-40 cursor-default bg-transparent"
					/>

					<div className="fixed left-0 top-0 z-50 flex h-screen w-72 flex-col items-center rounded-r-[30px] bg-brand-mint-dark px-8 pt-10">
						<div className="mt-14 w-48">
							<div className="flex flex-col gap-2">
								<button
									type="button"
									className="flex w-full items-center gap-4 py-4 text-left text-white"
								>
									<GoHome className="h-6 w-6 shrink-0" />

									<span className="text-xl font-bold">
										Inicio
									</span>
								</button>

								<button
									type="button"
									className="flex w-full items-center gap-4 py-4 text-left text-white"
								>
									<IoRestaurantOutline className="h-6 w-6 shrink-0" />

									<span className="text-xl font-bold">
										Menú
									</span>
								</button>

								<button
									type="button"
									className="flex w-full items-center gap-4 py-4 text-left text-white"
								>
									<LuShoppingBag className="h-6 w-6 shrink-0" />

									<span className="text-xl font-bold">
										Pedidos
									</span>
								</button>
							</div>

							<div className="mt-10 flex flex-col gap-2">
								<button
									type="button"
									className="flex w-full items-center py-4 text-left text-white"
								>
									<span className="text-xl font-bold">
										Descuentos
									</span>
								</button>

								<button
									type="button"
									className="flex w-full items-center py-4 text-left text-white"
								>
									<span className="text-xl font-bold">
										Reporte de ventas
									</span>
								</button>

								<button
									type="button"
									className="flex w-full items-center py-4 text-left text-white"
								>
									<span className="text-xl font-bold">
										Mesas
									</span>
								</button>
							</div>
						</div>
					</div>
				</>
			)}

			{/* Menú de perfil derecho */}
			{isProfileMenuOpen && (
				<>
					<button
						type="button"
						aria-label="Cerrar menú"
						onClick={() => setIsProfileMenuOpen(false)}
						className="fixed inset-0 z-40 cursor-default bg-transparent"
					/>

					<div className="fixed right-0 top-0 z-50 flex h-screen w-72 flex-col items-center rounded-l-[30px] bg-brand-mint-dark px-8 pt-10">
						<div className="mt-14 w-48">
							<Link
								to="/profileSettings"
								className="flex w-full items-center gap-4 py-4 text-left text-white"
							>
								<RiSettingsLine className="h-6 w-6 shrink-0" />

								<span className="text-xl font-bold">
									Perfil
								</span>
							</Link>

							<button
								type="button"
								className="flex w-full items-center gap-4 py-4 text-left text-white"
							>
								<IoMdInformationCircleOutline className="h-6 w-6 shrink-0" />

								<span className="text-xl font-bold">
									Negocio
								</span>
							</button>

							<button
								type="button"
								className="flex w-full items-center gap-4 py-4 text-left text-white"
							>
								<RiNotification2Line className="h-6 w-6 shrink-0" />

								<span className="text-xl font-bold">
									Notificaciones
								</span>
							</button>

							<Link
								to="/login"
								className="mt-10 flex w-full items-center gap-4 py-4 text-left text-white"
							>
								<LuLogOut className="h-6 w-6 shrink-0" />

								<span className="text-xl font-bold">
									Cerrar sesión
								</span>
							</Link>
						</div>
					</div>
				</>
			)}
		</main>
	);
}

export default DashboardForm;