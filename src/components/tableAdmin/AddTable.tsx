import { Link } from "@tanstack/react-router";

import { HiArrowLeft } from "react-icons/hi";

import DashboardLayout from "../layout/DashboardLayout";
import { useState } from "react";

function EditTable() {
const [isSubmitting, setIsSubmitting] = useState(false);
    
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
								Añadir mesa
							</span>
						</Link>
					</div>


					<div className="mt-2 flex flex-1 flex-col gap-6 px-6 py-8 sm:px-8">

						<div className="mt-1">
						<input
							id="firstName"
							name="firstName"
							type="text"
						    value=""
							placeholder="Mesa"
							className="w-full rounded-lg border border-border px-4 py-3 text-text-primary outline-none focus:border-2 focus:border-brand-brown"
						/>
					    </div>

                        <div className="mt-1">
						<input
							id="firstName"
							name="firstName"
							type="number"
						    value=""
							placeholder="Sillas"
							className="w-full rounded-lg border border-border px-4 py-3 text-text-primary outline-none focus:border-2 focus:border-brand-brown"
						/>
					    </div>
                        <div className="flex gap-4 align-center justify-end mt-3">
                        <button type="button" className="flex justify-center w-[159px] cursor-pointer rounded-lg bg-brand-mint-dark px-3 py-2 text-base font-bold text-white hover:bg-brand-mint-dark/90">
                            Generar QR
                        </button>
                        </div>

						<div className="mt-auto flex flex-col">
						
                        <Link
							to="/TablesManagment"
							className="mt-16 block w-full cursor-pointer rounded-lg border border-brand-mint-dark px-4 py-3 text-center text-base font-bold text-brand-mint-dark hover:bg-brand-mint-dark/10"
						>
							Cancelar
						</Link>

						<button
							type="submit"
							disabled={isSubmitting}
							className="mt-6 w-full cursor-pointer rounded-lg bg-brand-mint-dark px-4 py-3 text-base font-bold text-white hover:bg-brand-mint-dark/90"
						>
							{isSubmitting ? "Guardando..." : "Guardar"}
						</button>
						</div>

					</div>
				</section>
				</main>
		</DashboardLayout>
	);
}

export default EditTable;