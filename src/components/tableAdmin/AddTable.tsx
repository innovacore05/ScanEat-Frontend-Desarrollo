
import { useState } from "react";
import { createTable } from "../../services/tableService";

type AddTableProps = {
	onClose: () => void;
	onCreated: (table: {
		id: string;
		tableNumber: number;
		chairNumber: number;
	}) => void;
};

function AddTable({ onClose, onCreated }: AddTableProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [tableNumber, setTableNumber] = useState("");
	const [chairNumber, setChairNumber] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	const handleCreateTable = async () => {
		const tableNumberValue = Number(tableNumber);
		const chairNumberValue = Number(chairNumber);

		if (!tableNumber || !chairNumber ||
			!Number.isFinite(tableNumberValue) || tableNumberValue <= 0 ||
			!Number.isFinite(chairNumberValue) || chairNumberValue <= 0) {
			setErrorMessage("Ingresá un número de mesa y una cantidad de sillas válidos.");
			return;
		}

		try {
			setIsSubmitting(true);
			setErrorMessage("");

			const table = await createTable(
				tableNumberValue,
				chairNumberValue
			);

			onCreated({
				id: table.id,
				tableNumber: tableNumberValue,
				chairNumber: chairNumberValue
			});

		} catch (error) {
			console.error("Error creando mesa:", error);
			setErrorMessage("No se pudo crear la mesa.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div
			className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4"
			onClick={onClose}
			role="dialog"
			aria-modal="true"
		>
			<div
				className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="mb-6 flex items-center justify-between">
					<h2 className="text-2xl font-bold text-mint-dark">
						Añadir mesa
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
					<input
						type="number"
						min="1"
						value={tableNumber}
						onChange={(e) => setTableNumber(e.target.value)}
						placeholder="Número de mesa"
						className="w-full rounded-lg border border-border px-4 py-3 text-text-primary outline-none focus:border-2 focus:border-brown"
					/>

					<input
						type="number"
						min="1"
						value={chairNumber}
						onChange={(e) => setChairNumber(e.target.value)}
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
						onClick={handleCreateTable}
						disabled={isSubmitting}
						className="rounded-lg bg-mint-dark px-5 py-3 font-bold text-white hover:bg-mint-dark/90 disabled:opacity-50"
					>
						{isSubmitting ? "Guardando..." : "Guardar"}
					</button>
				</div>
			</div>
		</div>
	);
}

export default AddTable;
