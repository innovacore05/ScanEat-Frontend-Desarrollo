import { Link } from "@tanstack/react-router";
import { getProfile } from "../../services/authService";
import { HiArrowLeft } from "react-icons/hi";
import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import { IoIosAdd } from "react-icons/io";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import { getTables, deleteTable } from "../../services/tableService";
import QrCodeModal from "./QRCodeModal";


export type TableItem = {
	id: string;
	tableNumber: number;
	chairNumber: number;
	active?: boolean;
	createdAt?: string;
};

function TablesManagment() {
	const [firstName, setFirstName] = useState("");
	const [tables, setTables] = useState<TableItem[]>([]);
	const [isQrModalOpen, setIsQrModalOpen] = useState(false);
	const [qrValue, setQrValue] = useState("");
	const [qrTableNumber, setQrTableNumber] = useState<number | string>("");
	const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);

	const handleShowQr = (tableId: string, tableNumber: number) => {
		setQrValue(`https://scaneat-frontend-produccion-production.up.railway.app/menuClient?mesaId=${tableId}`);
		setQrTableNumber(tableNumber);
		setIsQrModalOpen(true);
	};

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

	useEffect(() => {
		const loadTables = async () => {
			try {
				const data = await getTables();
				setTables(data);
			} catch (error) {
				console.error("Error trayendo mesas:", error);
			}
		};

		loadTables();
	}, []);

	const handleDeleteTable = async (tableId: string) => {
		if (window.confirm("¿Estás seguro de que deseas eliminar esta mesa?")) {
			try {
				await deleteTable(tableId);
				setTables(tables.filter((table) => table.id !== tableId));
			} catch (error) {
				console.error("Error eliminando mesa:", error);
			}
		}
	};



	return (
		<DashboardLayout>
			<main className="flex min-h-screen flex-col bg-white ">
				{/* Celular */}
				<section className="flex flex-1 flex-col lg:hidden">
					<div className="flex items-center gap-2">
						<Link
							to="/dashboard"
							className="flex items-center gap-2 px-8 text-mint-dark"
						>
							<HiArrowLeft className="h-6 w-6" />

							<span className="text-[32px] font-bold">Mesas</span>
						</Link>
					</div>

					<div className="mt-2 flex flex-1 flex-col gap-6 rounded-t-4xl bg-neutral-50 px-6 py-8 sm:px-8">
						<div className="mt-4 flex flex-col gap-2">
							{tables.length === 0 ? (
								<p>No hay mesas creadas.</p>
							) : (
								tables.map((table) => (
									<div
										key={table.id}
										onClick={() => setSelectedTable(table)}
										className={`flex cursor-pointer items-center justify-between gap-3 rounded border px-3 py-2 text-left text-s font-bold text-text-primary ${selectedTable?.id === table.id
											? "border-mint-dark border-2 bg-mint-dark/10"
											: "border-border hover:border-mint-dark"
											}`}
									>
										<span>Mesa #{table.tableNumber}</span>
										<button
											type="button"
											onClick={(event) => {
												event.stopPropagation();
												handleShowQr(table.id, table.tableNumber);
											}}
											className="rounded bg-mint-dark px-3 py-1 text-xs text-white hover:bg-mint-dark/90"
										>
											Ver QR
										</button>
									</div>
								))
							)}
						</div>

						<QrCodeModal
							isOpen={isQrModalOpen}
							value={qrValue}
							numeroMesa={qrTableNumber}
							onClose={() => setIsQrModalOpen(false)}
						/>

						<div className="mt-auto flex flex-col gap-4">
							<Link
								to="/editTable"
								search={{ tableId: selectedTable?.id }}
								className={`mt-7 w-full cursor-pointer rounded-lg px-4 py-3 text-base font-bold text-white ${selectedTable ? 'bg-mint-dark hover:bg-mint-dark/90' : 'bg-mint-dark/50 cursor-not-allowed'}`}
								disabled={!selectedTable}
							>
								<span className="font-bold text-white justify-center flex">
									Editar mesa
								</span>
							</Link>

							<Link
								to="/addTable"
								className="w-full cursor-pointer rounded-lg bg-mint-dark px-4 py-3 text-base font-bold text-white hover:bg-mint-dark/90"
							>
								<span className="font-bold text-white justify-center flex">
									Añadir mesa
								</span>
							</Link>

							<button className="w-full cursor-pointer rounded-lg bg-mint-dark px-4 py-3 text-base font-bold text-white hover:bg-mint-dark/90"
								onClick={() => selectedTable && handleDeleteTable(selectedTable.id)}>
								<span className="font-bold text-white justify-center flex">
									Eliminar mesa
								</span>
							</button>
						</div>
					</div>
				</section>

				{/* Computadora */}

				<section className="hidden px-15 py-15 lg:block">
					<div className="rounded-2xl bg-mint-dark px-8 py-6">
						<h1 className="text-3xl font-bold text-white">
							¡Hola, {firstName || "Usuario"}!
						</h1>
					</div>


					<div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-2">
						<div>
							<div className="flex items-center justify-between">
								<h2 className="text-2xl font-bold text-mint-dark">
									Mesas
								</h2>

								<div className="flex gap-3">
									<Link
										to="/addTable"
										className="flex items-center justify-between rounded border w-40 h-8.5 border-border px-3 py-2 text-s font-bold text-text-primary"
									>
										<span>Añadir mesa</span>
										<IoIosAdd className="text-mint-darker w-8 h-8" />
									</Link>

									<Link
										to="/editTable"
										search={{ tableId: selectedTable?.id }}
										className={`flex items-center justify-between rounded border w-40 h-8.5 px-3 py-2 text-s font-bold ${selectedTable ? 'border-border text-text-primary hover:border-mint-dark' : 'border-border/50 text-text-primary/50 cursor-not-allowed'}`}
										disabled={!selectedTable}
									>
										<span>Editar mesa</span>
										<MdOutlineModeEditOutline className={`w-6 h-6 ${selectedTable ? 'text-mint-darker' : 'text-mint-darker/50'}`} />
									</Link>

									<button className="flex items-center justify-between rounded border w-40 h-8.5 border-border px-3 py-2 text-s font-bold text-text-primary"
										onClick={() => selectedTable && handleDeleteTable(selectedTable.id)}>
										<span>Eliminar mesa</span>
										<AiOutlineDelete className="text-mint-darker w-5 h-5" />

									</button>
								</div>
							</div>

							<div className="mt-4 flex flex-col gap-2">
								{tables.length === 0 ? (
									<p>No hay mesas creadas.</p>
								) : (
									tables.map((table) => (
										<div
											key={table.id}
											onClick={() => setSelectedTable(table)}
											className={`flex cursor-pointer items-center justify-between gap-3 rounded border px-3 py-2 text-left text-s font-bold text-text-primary ${selectedTable?.id === table.id
													? "border-mint-dark border-2 bg-mint-dark/10"
													: "border-border hover:border-mint-dark"
												}`}
										>
											<span>Mesa #{table.tableNumber}</span>
											<button
												type="button"
												onClick={(event) => {
													event.stopPropagation();
													handleShowQr(table.id, table.tableNumber);
												}}
												className="rounded bg-mint-dark px-3 py-1 text-xs text-white hover:bg-mint-dark/90"
											>
												Ver QR
											</button>
										</div>
									))
								)}
							</div>

							<QrCodeModal
								isOpen={isQrModalOpen}
								value={qrValue}
								numeroMesa={qrTableNumber}
								onClose={() => setIsQrModalOpen(false)}
							/>
						</div>

						<div>
							<p className="text-lg font-bold text-text-primary">
								Detalles de mesa
							</p>

							{selectedTable ? (
								<div className="mt-2 rounded-lg bg-mint-dark px-4 py-3 text-white">
									<p className="text-lg font-bold">Mesa #{selectedTable.tableNumber}</p>
									<p className="mt-2 text-s">Asientos: {selectedTable.chairNumber}</p>
									<p className="text-s">Mesero asignado: Luisa</p>
								</div>
							) : (
								<p className="mt-2 text-text-primary">Selecciona una mesa para ver sus detalles.</p>
							)}

							<div className="mt-5 rounded-lg bg-neutral-100 px-4 py-4">
								<p className="text-lg font-bold text-text-primary">
									Orden actual
								</p>

								<p className="mt-3 text-xs text-text-primary">
									Esta mesa no tiene una orden activa.
								</p>
							</div>
						</div>
					</div>
				</section>
			</main>
		</DashboardLayout>
	);
}

export default TablesManagment;
