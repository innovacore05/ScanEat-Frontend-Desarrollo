import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getProfile } from "../../services/authService";
import { HiArrowLeft } from "react-icons/hi";
import { GoPlus } from "react-icons/go";
import { IoSearch } from "react-icons/io5";
import { LuCakeSlice } from "react-icons/lu";
import { RiDrinks2Line } from "react-icons/ri";
import { GiCoffeeCup } from "react-icons/gi";
import { LuSandwich } from "react-icons/lu";
import { LuUtensils } from "react-icons/lu";
import DashboardLayout from "../../components/layout/DashboardLayout";
import DishCard from "../menu/DishCard";

function MenuManagment() {

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
			<main className="min-h-screen bg-brand-white px-8 py-8">

				{/* Celular */}
				<section className="lg:hidden">

					<div className="flex items-center gap-2">
						<Link
							to="/dashboard"
							className="flex items-center gap-2 text-brand-mint-dark"
						>
							<HiArrowLeft className="h-6 w-6" />

							<span className="text-[32px] font-bold">
								Gestión de menús
							</span>
						</Link>
					</div>

					<div className="mt-8 flex flex-col gap-5">

						<Link
							to=""
							className="flex items-center rounded-lg border border-border px-4 py-3"
						>
							<span className="text-base font-bold text-text-primary">
								Añadir un platillo simple
							</span>
						</Link>

						<Link
							to=""
							className="flex items-center rounded-lg border border-border px-4 py-3"
						>
							<span className="text-base font-bold text-text-primary">
								Añadir un platillo personalizado
							</span>
						</Link>

						<Link
							to="/editMenu"
							className="flex items-center rounded-lg border border-border px-4 py-3"
						>
							<span className="text-base font-bold text-text-primary">
								Editar menú
							</span>
						</Link>

					</div>
				</section>

                {/* Computadora */}
                
				<section className="hidden lg:block">

					<div className="rounded-2xl bg-brand-mint-dark px-8 py-6">
						<h1 className="text-3xl font-bold text-white">
							Hola, {firstName + "!"|| "Usuario !"}
						</h1>
					</div>

					<h2 className="mt-8 text-2xl font-bold text-black">
						Menú
					</h2>

					<div className="mt-6 flex gap-4">

						<Link
							to=""
							className="flex items-center justify-between gap-8 rounded-lg border border-border px-5 py-3"
						>
							<span className="text-base font-bold text-text-primary">
								Añadir un platillo simple
							</span>

							<GoPlus className="h-6 w-6 shrink-0 text-brand-mint-dark" />
						</Link>

						<Link
							to=""
							className="flex items-center justify-between gap-8 rounded-lg border border-border px-5 py-3"
						>
							<span className="text-base font-bold text-text-primary">
								Añadir un platillo personalizado
							</span>

							<GoPlus className="h-6 w-6 shrink-0 text-brand-mint-dark" />
						</Link>

					</div>

					<div className="mt-8 w-2/5 flex items-center rounded-lg border border-border bg-white px-4 py-3">

						<input
							type="text"
							placeholder="Buscar un platillo"
							className="w-full bg-transparent text-base font-normal text-text-primary outline-none placeholder:text-text-primary"
						/>

						<IoSearch className="ml-3 h-6 w-6 shrink-0 text-brand-mint-dark" />

					</div>

					<div className="mt-6">

						<p className="mb-3 text-base font-bold text-text-primary">
							Filtro
						</p>

						<div className="flex items-center gap-5">

							<button
								type="button"
								className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-mint-dark text-white"
								aria-label="Postres"
							>
								<LuCakeSlice className="h-8 w-8" />
							</button>

							<button
								type="button"
								className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-mint-dark text-white"
								aria-label="Bebidas"
							>
								<RiDrinks2Line className="h-8 w-8" />
							</button>

							<button
								type="button"
								className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-mint-dark text-white"
								aria-label="Café"
							>
								<GiCoffeeCup className="h-8 w-8" />
							</button>

							<button
								type="button"
								className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-mint-dark text-white"
								aria-label="Salados"
							>
								<LuSandwich className="h-8 w-8" />
							</button>

							<button
								type="button"
								className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-mint-dark text-white"
								aria-label="Almuerzos"
							>
								<LuUtensils className="h-8 w-8" />
							</button>

						</div>
					</div>

					<h2 className="mt-8 text-2xl font-bold text-black">
						Menú popular
					</h2>

					{/* Platillos */}
					<div className="mt-6 flex flex-wrap gap-4">

						<div className="w-full lg:w-[350px]">
							<DishCard
								name="Casado con chuleta"
								description="Casado con chuleta, frijoles, plátano maduro, ensalada y huevo frito."
								price={3500}
								image="/img/01Garabatos_Oct25-46.jpg"
								rating={4}
								isAdmin={true}
							/>
						</div>

						<div className="w-full lg:w-[350px]">
							<DishCard
								name="Lasaña"
								description="Lasaña acompañada de pan tostado y ensalada fresca."
								price={4000}
								image="/img/01Garabatos_Oct25-62.jpg"
								rating={5}
								isAdmin={true}
							/>
						</div>

					</div>

				</section>

			</main>
		</DashboardLayout>
	);
}

export default MenuManagment;