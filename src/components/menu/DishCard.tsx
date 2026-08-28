import { FaRegStar, FaStar } from "react-icons/fa6";
import { FaPlusCircle } from "react-icons/fa";
import { MdOutlineEdit, MdDeleteOutline } from "react-icons/md";

interface DishCardProps {
	name: string;
	description: string;
	price: number;
	image: string;
	rating: number;
	isAdmin: boolean;
}

function DishCard({
	name,
	description,
	price,
	image,
	rating,
	isAdmin,
}: DishCardProps) {
	return (
		<article className="flex w-full flex-row overflow-hidden rounded-2xl bg-white shadow-sm lg:h-[360px] lg:flex-col">

            <div className="w-32 shrink-0 self-stretch lg:h-48 lg:w-full">
				<img
					src={image}
					alt={name}
					className="h-full w-full rounded-2xl object-cover"
				/>
			</div>

			<div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center px-4 py-3">
				<h2 className="text-base font-bold text-brand-mint-darker">
					{name}
				</h2>

				<p className="mt-1 text-sm text-text-primary">
					{description}
				</p>

				<span className="mt-2 text-base font-bold text-brand-mint-darker">
					₡{price.toLocaleString("es-CR")}
				</span>

				<div className="mt-1 flex items-center justify-between">
					<div className="flex items-center gap-1 text-yellow">
						{[1, 2, 3, 4, 5].map((star) =>
							star <= rating ? (
								<FaStar key={star} />
							) : (
								<FaRegStar key={star} />
							),
						)}
					</div>

					<div className="flex items-center gap-2">
						{isAdmin ? (
							<>
								<button
									type="button"
									className="cursor-pointer text-brand-mint-dark"
									aria-label={`Editar ${name}`}
								>
									<MdOutlineEdit className="h-6 w-6" />
								</button>

								<button
									type="button"
									className="cursor-pointer text-red-600"
									aria-label={`Eliminar ${name}`}
								>
									<MdDeleteOutline className="h-6 w-6" />
								</button>
							</>
						) : (
							<button
								type="button"
								className="cursor-pointer text-brand-mint-dark"
								aria-label={`Agregar ${name}`}
							>
								<FaPlusCircle className="h-7 w-7" />
							</button>
						)}
					</div>
				</div>
			</div>
		</article>
	);
}

export default DishCard;