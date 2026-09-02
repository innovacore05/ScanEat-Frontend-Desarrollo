import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { HiArrowLeft } from "react-icons/hi";
import { getProfile } from "../../services/authService";
import DashboardLayout from "../layout/DashboardLayout";
import { useEffect, useState } from "react";
import { IoIosAdd } from "react-icons/io";
import { MdOutlineModeEditOutline } from "react-icons/md";
import {
	getTableById,
	getTables,
	updateTableChairs,
} from "../../services/tableService";

type TableItem = {
	id: string;
	tableNumber: number;
	chairNumber: number;
};

function EditTable() {
	const navigate = useNavigate();
	const { tableId } = useSearch({ from: "/(tableAdmin)/editTable" });
	const [tableNumber, setTableNumber] = useState("");
	const [chairs, setChairs] = useState("");
	const [firstName, setFirstName] = useState("");
	const [tables, setTables] = useState<TableItem[]>([]);
	const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

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

	const applyTableToForm = (table: TableItem) => {
		setSelectedTable(table);
		setTableNumber(String(table.tableNumber));
		setChairs(String(table.chairNumber));
	};

	useEffect(() => {
		const loadTables = async () => {
			try {
				const data = await getTables();
				setTables(data);

				if (tableId) {
					const fromList = data.find((table) => table.id === tableId);
					if (fromList) {
						applyTableToForm(fromList);
						return;
					}

					const byId = await getTableById(tableId);
					if (byId) {
						applyTableToForm(byId);
						return;
					}
				}

				if (data.length > 0) {
					applyTableToForm(data[0]);
					return;
				}

				setSelectedTable(null);
				setTableNumber("");
				setChairs("");
			} catch (error) {
				console.error("Error trayendo mesas:", error);
			}
		};

		loadTables();
	}, [tableId]);

	const handleSelectTable = (table: TableItem) => {
		applyTableToForm(table);
	};

	const handleUpdateTable = async () => {
		if (!selectedTable) return;

		const tableNumberValue = Number(tableNumber);
		const chairNumberValue = Number(chairs);

		if (!Number.isFinite(tableNumberValue) || tableNumberValue <= 0) return;
		if (!Number.isFinite(chairNumberValue) || chairNumberValue <= 0) return;

		try {
			setIsSubmitting(true);

			await updateTableChairs(
				selectedTable.id,
				tableNumberValue,
				chairNumberValue
			);

			navigate({ to: "/TablesManagment" });
		} catch (error) {
			console.error("Error actualizando mesa:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<DashboardLayout>
			<main className="flex min-h-screen flex-col bg-white pt-8 pb-0">
				{/* Celular */}
				<section className="flex flex-1 flex-col lg:hidden">
					<div className="flex items-center gap-2">
						<Link to="/dashboard" className="flex items-center gap-2 px-8 text-mint-dark">
							<HiArrowLeft className="h-6 w-6" />
							<span className="text-[32px] font-bold">
								Editar mesa
							</span>
						</Link>
					</div>

					<div className="mt-2 flex flex-1 flex-col gap-6 px-6 py-8 sm:px-8">
						<div className="w-full rounded-lg border border-border px-4 py-3 text-text-primary outline-none focus:border-2 focus:border-brown">
							<p>
								Mesa #{tableNumber}
							</p>
						</div>

						<div className="mt-1">
							<input
								type="number"
								value={chairs}
								onChange={(event) => setChairs(event.target.value)}
								placeholder="Cantidad de sillas"
								className="w-full rounded-lg border border-border px-4 py-3 text-text-primary outline-none focus:border-2 focus:border-brown"
							/>
						</div>

						<div className="flex justify-end">
							<button
								type="button"
								className="flex w-39.75 cursor-pointer justify-center rounded-lg bg-mint-dark px-3 py-2 text-base font-bold text-white hover:bg-mint-dark/90"
							>
								Generar QR
							</button>
						</div>

						<div className="mt-auto flex flex-col">
							<Link
								to="/TablesManagment"
								className="mt-16 block w-full cursor-pointer rounded-lg border border-mint-dark px-4 py-3 text-center text-base font-bold text-mint-dark hover:bg-mint-dark/10"
							>
								Cancelar
							</Link>

							<button
								type="button"
								onClick={handleUpdateTable}
								disabled={isSubmitting || !selectedTable}
								className="mt-6 w-full cursor-pointer rounded-lg bg-mint-dark px-4 py-3 text-base font-bold text-white hover:bg-mint-dark/90 disabled:cursor-not-allowed disabled:opacity-70"
							>
								{isSubmitting ? "Guardando..." : "Guardar"}
							</button>
						</div>
					</div>
				</section>

				{/* Computadora */}
				<section className="hidden px-8 py-8 lg:block">
					<div className="rounded-lg bg-mint-dark px-8 py-8">
						<h1 className="text-2xl font-bold text-white">
							¡Hola, {firstName || "Usuario"}!
						</h1>
					</div>

					<div className="mt-5 px-2 py-2">
						<div>
							<div className="flex items-center justify-between">
								<h2 className="text-2xl font-bold text-mint-dark">Mesas</h2>

								<div className="flex items-start gap-8">
									<Link
										to="/addTable"
										className="flex h-8.5 w-41.75 items-center justify-between rounded border border-border px-3 py-2 text-s font-bold text-text-primary"
									>
										<span>Añadir mesa</span>
										<IoIosAdd className="h-8 w-8 text-mint-darker" />
									</Link>

									<Link
										to="/editTable"
										className="flex h-8.5 w-41.75 items-center justify-between rounded border-4 border-mint px-3 py-2 text-s font-bold text-text-primary"
									>
										<span>Editar mesa</span>
										<MdOutlineModeEditOutline className="h-6 w-6 text-mint-darker" />
									</Link>
								</div>
							</div>

							<div className="mt-8 rounded border border-border">
								

								<div className="mt-2 flex flex-1 flex-col gap-3 px-8 py-3">
									<div className="mt-1 text-mint-darker">
										<p className="w-full rounded-lg border border-border px-4 py-2 outline-none focus:border-2 focus:border-brown">
											Mesa #{tableNumber}
										</p>
									</div>

									<div className="mt-1 text-mint-darker">
										<input
											id="chairNumber"
											name="chairNumber"
											type="number"
											value={chairs}
											onChange={(event) => setChairs(event.target.value)}
											placeholder="Cantidad de sillas"
											className="w-full rounded-lg border border-border px-4 py-2 outline-none focus:border-2 focus:border-brown"
										/>
									</div>

									<div className="mt-7 mb-4 flex justify-end gap-10 align-center">
										<button
											type="button"
											className="flex w-39.75 cursor-pointer justify-center rounded-lg bg-mint-dark px-3 py-2 text-base font-bold text-white hover:bg-mint-dark/90"
										>
											Generar QR
										</button>

										<button
											type="button"
											onClick={handleUpdateTable}
											disabled={isSubmitting || !selectedTable}
											className="flex w-39.75 cursor-pointer justify-center rounded-lg bg-mint-dark px-3 py-2 text-base font-bold text-white hover:bg-mint-dark/90 disabled:cursor-not-allowed disabled:opacity-70"
										>
											{isSubmitting ? "Guardando..." : "Guardar"}
										</button>
									</div>
								</div>
							</div>

							<div className="mt-14 flex flex-col gap-4">
								{tables.length === 0 ? (
									<p>No hay mesas creadas.</p>
								) : (
									tables.map((table) => (
										<button
											key={table.id}
											type="button"
											onClick={() => handleSelectTable(table)}
											className={`rounded border px-3 py-2 text-left text-[14px] font-bold text-text-primary hover:border-mint-dark ${selectedTable?.id === table.id
													? "border-mint-dark border-2 bg-mint-dark/10"
													: "border-border"
												}`}
										>
											Mesa #{table.tableNumber}
										</button>
									))
								)}
							</div>
						</div>
					</div>
				</section>
			</main>
		</DashboardLayout>
	);
}

export default EditTable;
