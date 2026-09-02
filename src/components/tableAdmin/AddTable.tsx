import { Link } from "@tanstack/react-router";
import { HiArrowLeft } from "react-icons/hi";
import { getProfile } from "../../services/authService";
import DashboardLayout from "../layout/DashboardLayout";
import { useEffect, useState } from "react";
import { IoIosAdd } from "react-icons/io";
import { MdOutlineModeEditOutline } from "react-icons/md";
import QrCodeModal from "../tableAdmin/QRCodeModal";
import { createTable, getTables } from "../../services/tableService";

function AddTable() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [tableNumber, setTableNumber] = useState("");
	const [chairNumber, setChairNumber] = useState("");
	const [firstName, setFirstName] = useState("");
	const [isQrModalOpen, setIsQrModalOpen] = useState(false);
	const [qrValue, setQrValue] = useState("");
	const [qrTableNumber, setQrTableNumber] = useState<number | string>("");
	const [tables, setTables] = useState<any[]>([]);
	const [createdTableId, setCreatedTableId] = useState<string | null>(null);


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

	const openQrForTable = (tableId: string, numeroMesa: number | string) => {
  const qrUrl = `https://scaneat-frontend-produccion-production.up.railway.app/menuClient?mesaId=${tableId}`;
  setQrValue(qrUrl);
	  setQrTableNumber(numeroMesa);
  setIsQrModalOpen(true);
};

	const handleCreateTable = async () => {
		const tableNumberValue = Number(tableNumber);
		const chairNumberValue = Number(chairNumber);

		if (!Number.isFinite(tableNumberValue) || tableNumberValue <= 0) return;
		if (!Number.isFinite(chairNumberValue) || chairNumberValue <= 0) return;

		try {
			setIsSubmitting(true);

			const table = await createTable(tableNumberValue, chairNumberValue);
			setCreatedTableId(table.id);
			openQrForTable(table.id, tableNumberValue);
		} catch (error) {
			console.error(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleGenerateQr = () => {
		if (createdTableId) openQrForTable(createdTableId, qrTableNumber);
	};

	return (
		<DashboardLayout>
			<main className="flex min-h-screen flex-col bg-white pt-8 pb-0">

				{/* Celular */}
				<section className="flex flex-1 flex-col lg:hidden">

					<div className="flex items-center gap-2">
						<Link
							to="/dashboard"
							className="flex items-center gap-2 px-8 text-mint-dark"
						>
							<HiArrowLeft className="h-6 w-6" />

							<span className="text-[32px] font-bold">
								Añadir mesa
							</span>
						</Link>
					</div>


					<div className="mt-2 flex flex-1 flex-col gap-6 px-6 py-8 sm:px-8">

						<div className="mt-1">
							<input
								type="number"
								value={tableNumber}
								onChange={(e) => {
									setTableNumber(e.target.value);
									setCreatedTableId(null);
								}}
								placeholder="Numero de mesa"
								className="w-full rounded-lg border border-border px-4 py-3 text-text-primary outline-none focus:border-2 focus:border-brown"
							/>
						</div>

						<div className="mt-1">
							<input
								type="number"
								value={chairNumber}
								onChange={(e) => {
									setChairNumber(e.target.value);
									setCreatedTableId(null);
								}}
								placeholder="Cantidad de sillas"
								className="w-full rounded-lg border border-border px-4 py-3 text-text-primary outline-none focus:border-2 focus:border-brown"
							/>
						</div>

						<div className="mt-3 flex items-center justify-end gap-4">
							<button
										type="button"
										onClick={() => handleGenerateQr()}
										className="flex w-39.75 cursor-pointer justify-center rounded-lg bg-mint-dark px-3 py-2 text-base font-bold text-white hover:bg-mint-dark/90"
										disabled={!createdTableId}
									>
										Generar QR
									</button>
									<QrCodeModal
									isOpen={isQrModalOpen}
									value={qrValue}
									numeroMesa={qrTableNumber}
									onClose={() => setIsQrModalOpen(false)}
									/>
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
								onClick={handleCreateTable}
								disabled={isSubmitting}
								className="mt-6 w-full cursor-pointer rounded-lg bg-mint-dark px-4 py-3 text-base font-bold text-white hover:bg-mint-dark/90"
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

					

					<div className="mt-8 px-2 py-2">
						<div>
							<div className="flex items-center justify-between">
								<h2 className="text-2xl font-bold text-mint-dark">
									Mesas
								</h2>

								<div className="flex gap-8 items-start">
									<Link
										to="/addTable"
										className="flex items-center justify-between rounded border-4 w-41.75 h-8.5 border-mint px-3 py-2 text-s font-bold text-text-primary"
									>
										<span>Añadir mesa</span>
										<IoIosAdd className="text-mint-darker w-8 h-8" />
									</Link>

									<Link
										to="/editTable"
										className="flex items-center justify-between rounded border w-41.75 h-8.5 border-border px-3 py-2 text-s font-bold text-text-primary"
									>
										<span>Editar mesa</span>
										<MdOutlineModeEditOutline className="text-mint-darker w-6 h-6" />
									</Link>
								</div>
							</div>

							<div className="mt-4 flex flex-col gap-2">
								{tables.length === 0 ? (
									<p>No hay mesas creadas.</p>
								) : (
									tables.map((table) => (
										<div key={table.id} className="rounded border border-border px-3 py-2 text-left text-s font-bold text-text-primary hover:border-mint-dark">
											Mesa #{table.tableNumber}
										</div>
									))
								)}
							</div>
						</div>

						<div className="mt-8 border border-border rounded">
							<p className=" font-bold text-text-primary px-8 py-6 text-md">Nueva mesa</p>


							<div className="mt-2 flex flex-1 flex-col gap-3 px-8 py-3">

								<div className="mt-1  text-mint-darker">
									<input
										type="number"
										value={tableNumber}
										onChange={(e) => {
											setTableNumber(e.target.value);
											setCreatedTableId(null);
										}}
										placeholder="Numero de mesa"
										className="w-full rounded-lg border border-border px-4 py-2 outline-none focus:border-2 focus:border-brown"
									/>
								</div>

								<div className="mt-1 text-mint-darker">
									<input
										type="number"
										value={chairNumber}
										onChange={(e) => {
											setChairNumber(e.target.value);
											setCreatedTableId(null);
										}}
										placeholder="Cantidad de sillas"
										className="w-full rounded-lg border border-border px-4 py-2 outline-none focus:border-2 focus:border-brown"
									/>
								</div>

								<div className="mt-7 mb-4 flex gap-10 align-center justify-end">
									<button
										type="button"
										onClick={() => handleGenerateQr()}
										className="flex w-39.75 cursor-pointer justify-center rounded-lg bg-mint-dark px-3 py-2 text-base font-bold text-white hover:bg-mint-dark/90"
										disabled={!createdTableId}
									>
										Generar QR
									</button>
									<QrCodeModal
									isOpen={isQrModalOpen}
									value={qrValue}
									numeroMesa={qrTableNumber}
									onClose={() => setIsQrModalOpen(false)}
									/>

									<button
										type="button"
										onClick={handleCreateTable}
										className="flex justify-center w-39.75 cursor-pointer rounded-lg bg-mint-dark px-3 py-2 text-base font-bold text-white hover:bg-mint-dark/90"
									>
										{isSubmitting ? "Guardando..." : "Guardar"}
									</button>
								</div>
							</div>
						</div>
					</div>
				</section>
			</main>
		</DashboardLayout >
	);
}

export default AddTable;
