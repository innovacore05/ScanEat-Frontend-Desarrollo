import { Link } from "@tanstack/react-router";
import { getProfile } from "../../services/authService";
import { HiArrowLeft } from "react-icons/hi";
import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import { RiErrorWarningLine } from "react-icons/ri";
import { IoIosAdd } from "react-icons/io";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { getTables } from "../../services/tableService";
import QrCodeModal from "./QRCodeModal";

type TableItem = {
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

	const handleShowQr = (tableId: string) => {
		setQrValue(`https://scaneat-frontend-produccion-production.up.railway.app/dashboard?mesaId=${tableId}`);
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


	return (
		<DashboardLayout>
			<main className="flex min-h-screen flex-col bg-brand-white pt-8 pb-0">
				{/* Celular */}
				<section className="flex flex-1 flex-col lg:hidden">
					<div className="flex items-center gap-2">
						<Link
							to="/dashboard"
							className="flex items-center gap-2 px-8 text-brand-mint-dark"
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
										<div key={table.id} className="flex items-center justify-between gap-3 rounded border border-border px-3 py-2 text-left text-s font-bold text-text-primary hover:border-brand-mint-dark">
											<span>Mesa #{table.tableNumber}</span>
											<button
												type="button"
												onClick={() => handleShowQr(table.id)}
												className="rounded bg-brand-mint-dark px-3 py-1 text-xs text-white hover:bg-brand-mint-dark/90"
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
								onClose={() => setIsQrModalOpen(false)}
							/>

						<div className="mt-auto flex flex-col gap-4">
							<Link
								to="/editTable"
								className="mt-7 w-full cursor-pointer rounded-lg bg-brand-mint-dark px-4 py-3 text-base font-bold text-white hover:bg-brand-mint-dark/90"
							>
								<span className="font-bold text-white justify-center flex">
									Editar mesa
								</span>
							</Link>

							<Link
								to="/addTable"
								className="w-full cursor-pointer rounded-lg bg-brand-mint-dark px-4 py-3 text-base font-bold text-white hover:bg-brand-mint-dark/90"
							>
								<span className="font-bold text-white justify-center flex">
									Añadir mesa
								</span>
							</Link>
						</div>
					</div>
				</section>

				{/* Computadora */}

				<section className="hidden px-8 py-8 lg:block">
					<div className="rounded-lg bg-brand-mint-dark px-8 py-8">
						<h1 className="text-2xl font-bold text-white">
							¡Hola, {firstName || "Usuario"}!
						</h1>
					</div>

					<div className="mt-6 flex items-start gap-2 rounded-lg border border-border px-6 py-5">
						<div>
							<p className="text-[24px] text-pink-500">Mesa esperando</p>
							<p className="text-[14px] text-text-primary">
								Mesa #1 lleva 00:00 esperando
							</p>
						</div>

						<RiErrorWarningLine className="ml-auto mt-0.5 h-15 w-15 shrink-0 text-pink-500" />
					</div>

					<div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-2">
						<div>
							<div className="flex items-center justify-between">
								<h2 className="text-2xl font-bold text-brand-mint-dark">
									Mesas
								</h2>

								<div className="flex gap-8">
									<Link
										to="/addTable"
										className="flex items-center justify-between rounded border w-41.75 h-8.5 border-border px-3 py-2 text-s font-bold text-text-primary"
									>
										<span>Añadir mesa</span>
										<IoIosAdd className="text-brand-mint-darker w-8 h-8" />
									</Link>

									<Link
										to="/editTable"
										className="flex items-center justify-between rounded border w-41.75 h-8.5 border-border px-3 py-2 text-s font-bold text-text-primary"
									>
										<span>Editar mesa</span>
										<MdOutlineModeEditOutline className="text-brand-mint-darker w-6 h-6" />
									</Link>
								</div>
							</div>

							<div className="mt-4 flex flex-col gap-2">
								{tables.length === 0 ? (
									<p>No hay mesas creadas.</p>
								) : (
									tables.map((table) => (
										<div key={table.id} className="flex items-center justify-between gap-3 rounded border border-border px-3 py-2 text-left text-s font-bold text-text-primary hover:border-brand-mint-dark">
											<span>Mesa #{table.tableNumber}</span>
											<button
												type="button"
												onClick={() => handleShowQr(table.id)}
												className="rounded bg-brand-mint-dark px-3 py-1 text-xs text-white hover:bg-brand-mint-dark/90"
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
								onClose={() => setIsQrModalOpen(false)}
							/>
						</div>

						<div>
							<p className="text-lg font-bold text-text-primary">
								Detalles de mesa
							</p>

							<div className="mt-2 rounded-lg bg-brand-mint-dark px-4 py-3 text-white">
								<p className="font-bold text-lg">Mesa #10</p>
								<p className="mt-2 text-s">Asientos: 4</p>
								<p className="text-s">Mesero asignado: Luisa</p>
								<p className="text-s">Zona: Segunda planta</p>
							</div>

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
