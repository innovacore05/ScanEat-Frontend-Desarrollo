import { Link } from "@tanstack/react-router";

import { HiArrowLeft } from "react-icons/hi";

import DashboardLayout from "../layout/DashboardLayout";

function TablesManagment() {

    
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

							<span className="text-[32px] font-bold">
								Mesas
							</span>
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
							to=""
							className="mt-7 w-full cursor-pointer rounded-lg bg-brand-mint-dark px-4 py-3 text-base font-bold text-white hover:bg-brand-mint-dark/90"
						>
							<span className="font-bold text-white justify-center flex">
								Editar mesa
							</span>
						</Link>


						<Link
							to="/AddTable"
							className="w-full cursor-pointer rounded-lg bg-brand-mint-dark px-4 py-3 text-base font-bold text-white hover:bg-brand-mint-dark/90"
						>
							<span className="font-bold text-white justify-center flex">
								Añadir mesa
							</span>
						</Link>
						</div>

					</div>
				</section>
				</main>
		</DashboardLayout>
	);
}

export default TablesManagment;