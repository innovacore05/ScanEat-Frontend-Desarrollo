import { IoSearch } from "react-icons/io5";
import { LuCakeSlice } from "react-icons/lu";
import { RiDrinks2Line } from "react-icons/ri";
import { GiCoffeeCup } from "react-icons/gi";
import { LuSandwich } from "react-icons/lu";
import { LuUtensils } from "react-icons/lu";
import DashboardLayout from "../../components/layout/DashboardLayout";
import DishCard from "../menu/DishCard";

//Editar menu celular
function EditMenu() {
	return (
		<DashboardLayout>
			<main className="min-h-screen bg-brand-white px-6 py-8">

				<div className="mt-2 flex items-center rounded-lg border border-border bg-white px-4 py-3">
					<input
						type="text"
						placeholder="Buscar un platillo"
						className="w-full bg-transparent text-base font-normal text-text-primary outline-none placeholder:text-text-primary"
					/>

					<IoSearch className="ml-3 h-6 w-6 shrink-0 text-mint-dark" />
				</div>

				<div className="mt-6">
					<p className="mb-3 text-base font-bold text-text-primary">
						Filtro
					</p>

					<div className="flex items-center gap-5">

						<button
							type="button"
							className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint-dark text-white"
							aria-label="Postres"
						>
							<LuCakeSlice className="h-8 w-8" />
						</button>

						<button
							type="button"
							className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint-dark text-white"
							aria-label="Bebidas"
						>
							<RiDrinks2Line className="h-8 w-8" />
						</button>

						<button
							type="button"
							className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint-dark text-white"
							aria-label="Café"
						>
							<GiCoffeeCup className="h-8 w-8" />
						</button>

						<button
							type="button"
							className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint-dark text-white"
							aria-label="Sándwiches"
						>
							<LuSandwich className="h-8 w-8" />
						</button>

						<button
							type="button"
							className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint-dark text-white"
							aria-label="Platos"
						>
							<LuUtensils className="h-8 w-8" />
						</button>

					</div>
				</div>

				<div className="mt-8 flex flex-col gap-4">
					<DishCard
						name="Casado con chuleta"
						description="Casado con chuleta, frijoles, plátano maduro, ensalada y huevo frito."
						price={3500}
						image="/img/01Garabatos_Oct25-46.jpg"
						rating={4}
						isAdmin={true}
						productId={1}
					/>

					<DishCard
						name="Lasaña"
						description="Lasaña acompañada de pan tostado y ensalada fresca."
						price={4000}
						image="/img/01Garabatos_Oct25-62.jpg"
						rating={5}
						isAdmin={true}
						productId={2}
					/>
				</div>

			</main>
		</DashboardLayout>
	);
}

export default EditMenu;