import { Link } from "@tanstack/react-router";
import { HiArrowLeft } from "react-icons/hi";
import { getProfile } from "../../services/authService";
import DashboardLayout from "../layout/DashboardLayout";
import { useEffect, useState } from "react";
import { IoIosAdd } from "react-icons/io";
import { MdOutlineModeEditOutline } from "react-icons/md";


function EditTable() {
    const [tableNumber, setTableNumber] = useState("");
    const [chairs, setChairs] = useState("");
    const [firstName, setFirstName] = useState("");
	const [isSubmitting] = useState(false);

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

                            <span className="text-[32px] font-bold">
                                Editar mesa
                            </span>
                        </Link>
                    </div>


                    <div className="mt-2 flex flex-1 flex-col gap-6 px-6 py-8 sm:px-8">

                        <div className="mt-1">
                        <input
                            type="text"
                            value={tableNumber}
                            onChange={(event) => setTableNumber(event.target.value)}
                            placeholder="Numero de mesa"
                            className="w-full rounded-lg border border-border px-4 py-3 text-text-primary outline-none focus:border-2 focus:border-brand-brown"
                        />
                        </div>

                        <div className="mt-1">
                        <input
                            type="number"
                            value={chairs}
                            onChange={(event) => setChairs(event.target.value)}
                            placeholder="Cantidad de sillas"
                            className="w-full rounded-lg border border-border px-4 py-3 text-text-primary outline-none focus:border-2 focus:border-brand-brown"
                        />
                        </div>
                        <div className="flex gap-4 align-center justify-end mt-3">
                        <button type="button" className="flex justify-center w-39.75 cursor-pointer rounded-lg bg-brand-mint-dark px-3 py-2 text-base font-bold text-white hover:bg-brand-mint-dark/90">
                            Generar QR
                        </button>
                        </div>

                        <div className="mt-auto flex flex-col">
                        
                        <Link
                            to="/TablesManagment"
                            className="mt-16 block w-full cursor-pointer rounded-lg border border-brand-mint-dark px-4 py-3 text-center text-base font-bold text-brand-mint-dark hover:bg-brand-mint-dark/10"
                        >
                            Cancelar
                        </Link>

                        <button
                            type="button"
                            className="mt-6 w-full cursor-pointer rounded-lg bg-brand-mint-dark px-4 py-3 text-base font-bold text-white hover:bg-brand-mint-dark/90"
                        >
                            Guardar
                        </button>
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


					<div className="mt-5 px-2 py-2">
						<div>
							<div className="flex items-center justify-between">
								<h2 className="text-2xl font-bold text-brand-mint-dark">
									Mesas
								</h2>

								<div className="flex gap-8 items-start">
									<Link
										to="/addTable"
										className="flex items-center justify-between rounded border w-41.75 h-8.5 border-border px-3 py-2 text-s font-bold text-text-primary"
									>
										<span>Añadir mesa</span>
										<IoIosAdd className="text-brand-mint-darker w-8 h-8" />
									</Link>

									<Link
										to="/editTable"
										className="flex items-center justify-between rounded border-4 w-41.75 h-8.5 border-brand-mint px-3 py-2 text-s font-bold text-text-primary"
									>
										<span>Editar mesa</span>
										<MdOutlineModeEditOutline className="text-brand-mint-darker w-6 h-6" />
									</Link>
								</div>
							</div>

                            <div className="mt-8 border border-border rounded">
							<p className=" font-bold text-text-primary px-8 py-6 text-md">Nueva mesa</p>


							<div className="mt-2 flex flex-1 flex-col gap-3 px-8 py-3">

								<div className="mt-1  text-brand-mint-darker">
									<input
										id="firstName"
										name="firstName"
										type="text"
										value=""
										placeholder="Numero de mesa"
										className="w-full rounded-lg border border-border px-4 py-2 outline-none focus:border-2 focus:border-brand-brown"
									/>
								</div>

								<div className="mt-1  text-brand-mint-darker">
									<input
										id="firstName"
										name="firstName"
										type="number"
										value=""
										placeholder="Cantidad de sillas"
										className="w-full rounded-lg border border-border px-4 py-2 outline-none focus:border-2 focus:border-brand-brown"
									/>
								</div>

								<div className="mt-7 mb-4 flex gap-10 align-center justify-end ">
									<button type="button" className="flex justify-center w-39.75 cursor-pointer rounded-lg bg-brand-mint-dark px-3 py-2 text-base font-bold text-white hover:bg-brand-mint-dark/90">
										Generar QR
									</button>

									<button
										type="submit"
										disabled={isSubmitting}
										className="flex justify-center w-39.75 cursor-pointer rounded-lg bg-brand-mint-dark px-3 py-2 text-base font-bold text-white hover:bg-brand-mint-dark/90"
									>
										{isSubmitting ? "Guardando..." : "Guardar"}
									</button>
								</div>
							</div>
						</div>

							<div className="mt-14 flex flex-col gap-4">
								{Array.from({ length: 3 }, (_, index) => (
									<button
										key={index}
										type="button"
										className="rounded border border-border px-3 py-2 text-left text-text-primary font-bold text-[14px]  hover:border-brand-mint-dark"
									>
										Mesa #{index + 10}
									</button>
								))}
							</div>
						</div>

					</div>
				</section>
			</main>
		</DashboardLayout>
	);
}

export default EditTable;