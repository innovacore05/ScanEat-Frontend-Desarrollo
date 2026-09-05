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
import DashboardLayoutWaiter from "../layout/DashboardLayoutWaiter";
import { ROLE_IDS } from "../../config/roles";


export type TableItem = {
	id: string;
	tableNumber: number;
	chairNumber: number;
	active?: boolean;
	createdAt?: string;
};

function TablesManagment() {
	const [firstName, setFirstName] = useState("");
	const [roleId, setRoleId] = useState<number | null>(null);
	const [tables, setTables] = useState<TableItem[]>([]);
	const [isQrModalOpen, setIsQrModalOpen] = useState(false);
	const [qrValue, setQrValue] = useState("");
	const [qrTableNumber, setQrTableNumber] = useState<number | string>("");
	const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

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
				setRoleId(data.user.roleId);
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

	const handleDeleteTable = async () => {
		if (!selectedTable) return;

		try {
			setIsDeleting(true);
			await deleteTable(selectedTable.id);
			setTables((currentTables) =>
				currentTables.filter((table) => table.id !== selectedTable.id),
			);
			setSelectedTable(null);
			setIsDeleteDialogOpen(false);
		} catch (error) {
			console.error("Error eliminando mesa:", error);
		} finally {
			setIsDeleting(false);
		}
	};

	const isOwner = roleId === ROLE_IDS.owner;
	const Layout = isOwner ? DashboardLayout : DashboardLayoutWaiter;
	const dashboardRoute = isOwner ? "/dashboard" : "/dashboardWaiter";

	return (
		<Layout>
			<main className="flex min-h-screen flex-col bg-white ">
				{/* Celular */}
				<section className="flex flex-1 flex-col lg:hidden">
					<div className="flex items-center gap-2">
						<Link
							to={dashboardRoute}
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
										{isOwner && <button
											type="button"
											onClick={(event) => {
												event.stopPropagation();
												handleShowQr(table.id, table.tableNumber);
											}}
											className="rounded bg-mint-dark px-3 py-1 text-xs text-white hover:bg-mint-dark/90"
										>
											Ver QR
										</button>}
									</div>
								))
							)}
						</div>

						{isOwner && <QrCodeModal
							isOpen={isQrModalOpen}
							value={qrValue}
							numeroMesa={qrTableNumber}
							onClose={() => setIsQrModalOpen(false)}
						/>}

						{isOwner && <div className="mt-auto flex flex-col gap-4">
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
								onClick={() => selectedTable && setIsDeleteDialogOpen(true)}>
								<span className="font-bold text-white justify-center flex">
									Eliminar mesa
								</span>
							</button>
						</div>}
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

								{isOwner && <div className="flex gap-3">
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
										onClick={() => selectedTable && setIsDeleteDialogOpen(true)}>
										<span>Eliminar mesa</span>
										<AiOutlineDelete className="text-mint-darker w-5 h-5" />

									</button>
								</div>}
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
											{isOwner && <button
												type="button"
												onClick={(event) => {
													event.stopPropagation();
													handleShowQr(table.id, table.tableNumber);
												}}
												className="rounded bg-mint-dark px-3 py-1 text-xs text-white hover:bg-mint-dark/90"
											>
												Ver QR
											</button>}
										</div>
									))
								)}
							</div>

							{isOwner && <QrCodeModal
								isOpen={isQrModalOpen}
								value={qrValue}
								numeroMesa={qrTableNumber}
								onClose={() => setIsQrModalOpen(false)}
							/>}
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

			{isDeleteDialogOpen && selectedTable && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
					role="dialog"
					aria-modal="true"
					aria-labelledby="delete-table-dialog-title"
				>
					<div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
						<h3
							id="delete-table-dialog-title"
							className="text-lg font-bold text-mint-darker"
						>
							¿Eliminar mesa?
						</h3>
						<p className="mt-2 text-sm text-text-primary">
							¿Deseas eliminar la mesa #{selectedTable.tableNumber}? Esta acción no se puede deshacer.
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
								onClick={handleDeleteTable}
								disabled={isDeleting}
								className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
							>
								{isDeleting ? "Eliminando..." : "Eliminar"}
							</button>
						</div>
					</div>
				</div>
			)}
		</Layout>
	);
}

export default TablesManagment;
