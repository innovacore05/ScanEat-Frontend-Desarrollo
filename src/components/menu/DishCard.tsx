import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { FaRegStar, FaStar } from "react-icons/fa6";
import { BsFillPlusCircleFill } from "react-icons/bs";
import { MdOutlineEdit, MdDeleteOutline } from "react-icons/md";
import { deleteProduct } from "../../services/productService";

interface DishCardProps {
	name: string;
	description: string;
	price: number;
	image: string;
	rating: number;
	isAdmin: boolean;
	productId?: number;
	onDelete?: (productId: number) => void;
	isDetailView?: boolean;
	showReviews?: boolean;
	onViewMore?: () => void;
	onCloseDetails?: () => void;
}

function DishCard({
	name,
	description,
	price,
	image,
	rating,
	isAdmin,
	productId,
	onDelete,
	isDetailView = false,
	showReviews = false,
	onViewMore,
	onCloseDetails,
}: DishCardProps) {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		if (!productId) return;

		try {
			setIsDeleting(true);
			await deleteProduct(productId);
			onDelete?.(productId);
			setIsDeleteDialogOpen(false);
		} catch (error) {
			console.error("Error deleting product:", error);
			const apiError = error as { message?: string };
			alert(apiError.message ?? "No se pudo eliminar el platillo");
		} finally {
			setIsDeleting(false);
		}
	};
	return (
		<>
			<article
				className={`flex w-full overflow-hidden rounded-2xl bg-white shadow-sm ${
				isDetailView ? "flex-col lg:h-107.5 lg:flex-row" : "flex-row lg:h-105 lg:flex-col"
			}`}
			>

			<div className={isDetailView ? "h-82 w-full shrink-0 lg:h-full lg:w-[59%]" : "w-32 shrink-0 self-stretch lg:h-48 lg:w-full"}>
				<img
					src={image}
					alt={name}
					className="h-full w-full rounded-2xl object-cover"
				/>
			</div>

			<div className={`flex min-h-0 min-w-0 flex-1 flex-col justify-center px-4 py-3 ${isDetailView ? "lg:px-8 lg:py-8" : ""}`}>
				<h2 className="text-base font-bold text-mint-darker">
					{name}
				</h2>

				<p className="mt-1 text-sm text-text-primary">
					{description}
				</p>

				<span className="mt-2 text-base font-bold text-mint-darker">
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
								{productId ? (
									<Link
										to="/simpleDishForm"
										search={{ mode: "edit", productId }}
										className="cursor-pointer text-mint-dark"
										aria-label={`Editar ${name}`}
									>
										<MdOutlineEdit className="h-6 w-6" />
									</Link>
								) : (
									<button
										type="button"
										className="cursor-pointer text-mint-dark"
										aria-label={`Editar ${name}`}
									>
										<MdOutlineEdit className="h-6 w-6" />
									</button>
								)}

								<button
									type="button"
									onClick={() => setIsDeleteDialogOpen(true)}
									className="cursor-pointer text-red-600"
									aria-label={`Eliminar ${name}`}
								>
									<MdDeleteOutline className="h-6 w-6" />
								</button>
							</>
						) : (
							<button
								type="button"
								className="cursor-pointer text-mint-dark"
								aria-label={`Agregar ${name}`}
							>
								<BsFillPlusCircleFill className="h-10 w-10" />
							</button>
						)}
					</div>
				</div>
				{isDetailView && showReviews && (
					<a href="#reviews" className="mt-3 self-start text-sm font-medium text-text-primary hover:underline">
						Reviews
					</a>
				)}
				<button
					type="button"
					onClick={isDetailView ? onCloseDetails : onViewMore}
					className="mt-2 cursor-pointer self-start text-sm font-bold text-brown hover:underline"
				>
					{isDetailView ? "Ver menos" : "Ver más"}
				</button>
			</div>
			</article>

			{isDeleteDialogOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
					role="dialog"
					aria-modal="true"
					aria-labelledby="delete-dialog-title"
				>
					<div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
						<h3 id="delete-dialog-title" className="text-lg font-bold text-mint-darker">
							¿Eliminar producto?
						</h3>
						<p className="mt-2 text-sm text-text-primary">
							¿Deseas eliminar &ldquo;{name}&rdquo;? Esta acción no se puede deshacer.
						</p>
						<div className="mt-6 flex justify-end gap-3">
							<button
								type="button"
								onClick={() => setIsDeleteDialogOpen(false)}
								disabled={isDeleting}
								className="cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-text-primary hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
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
		</>
	);
}

export default DishCard;
