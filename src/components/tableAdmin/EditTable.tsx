
import { useEffect, useState } from "react";
import { updateTableChairs } from "../../services/tableService";

type TableItem = {
	id: string;
	tableNumber: number;
	chairNumber: number;
	active?: boolean;
	createdAt?: string;
};

type EditTableProps = {
	table: TableItem;
	onClose: () => void;
	onUpdated: () => void;
};

function EditTable({ table, onClose, onUpdated }: EditTableProps) {
	const [chairs, setChairs] = useState(String(table.chairNumber));
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	useEffect(() => {
		setChairs(String(table.chairNumber));
	}, [table]);

	const handleUpdateTable = async () => {
		const chairNumberValue = Number(chairs);

		if (
			!chairs ||
			!Number.isFinite(chairNumberValue) ||
			chairNumberValue <= 0
		) {
			setErrorMessage("Ingresá una cantidad de sillas válida.");
			return;
		}

		try {
			setIsSubmitting(true);
			setErrorMessage("");

			await updateTableChairs(
				table.id,
				table.tableNumber,
				chairNumberValue
			);

			onUpdated();
		} catch (error) {
			console.error("Error actualizando mesa:", error);
			setErrorMessage("No se pudo actualizar la mesa.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div
			className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4"
			role="dialog"
			aria-modal="true"
			onClick={onClose}
		>
			<div
				className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
				onClick={(event) => event.stopPropagation()}
			>
				<div className="mb-6 flex items-center justify-between">
					<h2 className="text-2xl font-bold text-mint-dark">
						Editar mesa
					</h2>

					<button
						type="button"
						onClick={onClose}
						className="text-2xl text-gray-500 hover:text-gray-800"
					>
						&times;
					</button>
				</div>

				<div className="flex flex-col gap-4">
					<div className="w-full rounded-lg border border-border px-4 py-3 text-text-primary">
						Mesa #{table.tableNumber}
					</div>

					<input
						type="number"
						min="1"
						value={chairs}
						onChange={(event) => setChairs(event.target.value)}
						placeholder="Cantidad de sillas"
						className="w-full rounded-lg border border-border px-4 py-3 text-text-primary outline-none focus:border-2 focus:border-brown"
					/>

					{errorMessage && (
						<p className="text-sm text-red-600">
							{errorMessage}
						</p>
					)}
				</div>

				<div className="mt-8 flex justify-end gap-3">
					<button
						type="button"
						onClick={onClose}
						disabled={isSubmitting}
						className="rounded-lg border border-mint-dark px-4 py-3 font-bold text-mint-dark hover:bg-mint-dark/10"
					>
						Cancelar
					</button>

					<button
						type="button"
						onClick={handleUpdateTable}
						disabled={isSubmitting}
						className="rounded-lg bg-mint-dark px-5 py-3 font-bold text-white hover:bg-mint-dark/90 disabled:cursor-not-allowed disabled:opacity-70"
					>
						{isSubmitting ? "Guardando..." : "Guardar"}
					</button>
				</div>
			</div>
		</div>
	);
}

export default EditTable;
