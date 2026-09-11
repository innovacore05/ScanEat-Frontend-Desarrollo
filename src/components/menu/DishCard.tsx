import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FaRegStar, FaStar } from "react-icons/fa6";
import { BsFillPlusCircleFill } from "react-icons/bs";
import { MdOutlineEdit, MdDeleteOutline } from "react-icons/md";
import { useCart } from "../menuClient/CartContext";

import {
	deleteProduct,
	getProductById,
	isCustomProduct,
	productIsCustom,
} from "../../services/productService";

const EMPTY_OPTION_GROUPS: { id: string; name: string; options: string[] }[] = [];

interface DishCardProps {
	name: string;
	description: string;
	price: number;
	image: string;
	rating: number;
	isAdmin: boolean;
	showActions?: boolean;
	productId?: number;
	optionGroups?: { id: string; name: string; options: string[] }[];
	onDelete?: (productId: number) => void;
	isDetailView?: boolean;
	showReviews?: boolean;
	onViewMore?: () => void;
	onCloseDetails?: () => void;
	onAddToCart?: () => void;
}

function DishCard({
	name,
	description,
	price,
	image,
	rating,
	isAdmin,
	showActions = true,
	productId,
	optionGroups = EMPTY_OPTION_GROUPS,
	onDelete,
	isDetailView = false,
	showReviews = false,
	onViewMore,
	onCloseDetails,
	onAddToCart,
}: DishCardProps) {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isLoadingEdit, setIsLoadingEdit] = useState(false);
	const [detailOptionGroups, setDetailOptionGroups] = useState(optionGroups);
	const [isLoadingDetails, setIsLoadingDetails] = useState(false);
	const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
	const [validationMessage, setValidationMessage] = useState("");
	const navigate = useNavigate();
	const { addToCart } = useCart();

	useEffect(() => {
		setDetailOptionGroups(optionGroups);
	}, [optionGroups]);

	useEffect(() => {
		if (!isDetailView || !productId) {
			return;
		}

		let isCurrent = true;
		setIsLoadingDetails(true);

		const loadProductDetails = async () => {
			try {
				const product = await getProductById(productId);
				if (isCurrent) {
					setDetailOptionGroups(product.optionGroups ?? optionGroups);
				}
			} catch (error) {
				console.error("Error loading product details:", error);
			} finally {
				if (isCurrent) {
					setIsLoadingDetails(false);
				}
			}
		};

		loadProductDetails();

		return () => {
			isCurrent = false;
		};
	}, [isDetailView, productId, optionGroups]);

	const handleEdit = async () => {
		if (!productId) return;

		try {
			setIsLoadingEdit(true);
			const product = await getProductById(productId);
			const isCustom = product.isCustom !== undefined
				? product.isCustom === true || product.isCustom === 1
				: productIsCustom(product) || await isCustomProduct(productId);

			navigate({
				to: isCustom ? "/customDishForm" : "/simpleDishForm",
				search: { mode: "edit", productId },
			});
		} catch (error) {
			console.error("Error loading product to edit:", error);
			alert("No se pudo cargar la información del platillo");
		} finally {
			setIsLoadingEdit(false);
		}
	};

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

	const groupsOptions = async () => {
		if (!productId) return;

		try {
			setIsLoadingEdit(true);
			const product = await getProductById(productId);
			const isCustom = product.isCustom !== undefined
				? product.isCustom === true || product.isCustom === 1
				: productIsCustom(product) || await isCustomProduct(productId);

			if (isCustom) {
				setDetailOptionGroups(product.optionGroups ?? []);
				setSelectedOptions({});
				setValidationMessage("");
				setIsOptionsModalOpen(true);
		} else {
			addToCart({
        productId,
        name,
        price,
        image,
        quantity: 1,
        selectedOptions: {},
      });

      onAddToCart?.();
    }
			
		} catch (error) {
			console.error("Error loading product to edit:", error);
			alert("No se pudo cargar la información del platillo");
		} finally {
			setIsLoadingEdit(false);
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

				{isDetailView && (isLoadingDetails || detailOptionGroups.length > 0) && (
					<div className="mt-4">
						<h3 className="text-sm font-bold text-mint-darker">
							Opciones de personalización
						</h3>
						{isLoadingDetails && detailOptionGroups.length === 0 ? (
							<p className="mt-1 text-sm text-text-primary">Cargando opciones...</p>
						) : (
							<div className="mt-2 space-y-2">
								{detailOptionGroups.map((group) => (
									<div key={group.id}>
										<p className="text-sm font-semibold text-text-primary">{group.name}</p>
										<p className="text-sm text-text-primary">
											{group.options.join(", ")}
										</p>
									</div>
								))}
							</div>
						)}
					</div>
				)}

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
					

					{showActions && (
						<div className="flex items-center gap-2">
							{isAdmin ? (
								<>
								{productId ? (
									<button
										type="button"
										onClick={handleEdit}
										disabled={isLoadingEdit}
										className="cursor-pointer text-mint-dark"
										aria-label={`Editar ${name}`}
									>
										<MdOutlineEdit className="h-6 w-6" />
									</button>
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
									onClick={groupsOptions}
									className="cursor-pointer text-mint-dark"
									aria-label={`Agregar ${name}`}
								>
									<BsFillPlusCircleFill className="h-10 w-10" />
								</button>
							)}
						</div>
					)}
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

			{isOptionsModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
					<div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
						<h3 className="text-xl font-bold text-mint-darker">
							Personaliza tu "{name}"
						</h3>

						<div className="mt-6 space-y-6">
							{detailOptionGroups.map((group) => (
								<div key={group.id}>
									<h4 className="text-lg font-bold text-mint-darker">
										{group.name}
									</h4>
									
									<div className="mt-2 space-y-2">
										{group.options.map((option) => (
											<label
												key={option}
												className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 "
								>
									<input
										type="radio"
										name={group.id}
										value={option}
										checked={selectedOptions[group.id] === option}
										onChange={() =>
											setSelectedOptions((prev) => ({
												...prev,
												[group.id]: option,
											}))
										}
									/>

									<span className="text-base text-text-primary">
										{option}
									</span>
								</label>
							))}
						</div>
					</div>
				))}
						</div>
						
						{validationMessage && (
							<p className="mt-4 text-sm text-red-600">
								{validationMessage}
							</p>
						)}

			<div className="mt-6 flex justify-end gap-3">
				<button
					type="button"
					onClick={() => setIsOptionsModalOpen(false)}
					className="cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-text-primary hover:bg-gray-100"
				>
					Cancelar
				</button>

							<button
								type="button"
								onClick={() => {
									const missingGroups = detailOptionGroups.filter(
										(group) => !selectedOptions[group.id]
									);

									if (missingGroups.length > 0) {
										setValidationMessage(
											"Tienes que seleccionar una opción por cada grupo."
										);
										return;
									}
									
									addToCart({
										productId: productId!,
										name,
										price,
										image,
										quantity: 1,
										selectedOptions,
									});
									
									onAddToCart?.();
									
									setIsOptionsModalOpen(false);
								}}
								className="cursor-pointer rounded-lg bg-mint-dark px-4 py-2 text-sm font-semibold text-white hover:bg-mint-darker"
							>
								Agregar a la orden
							</button>
						
						</div>
					</div>
				</div>
			)}

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
