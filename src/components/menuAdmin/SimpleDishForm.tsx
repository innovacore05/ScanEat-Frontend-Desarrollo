import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getProfile } from "../../services/authService";
import { HiArrowLeft } from "react-icons/hi";
import { GoPlus } from "react-icons/go";
import { FiCamera } from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout";


function SimpleDishForm() {

    // const [isSubmitting, setIsSubmitting] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [discount, setDiscount] = useState<number | "">("");
    const [firstName, setFirstName] = useState("");

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
        if (!image) {
            setImagePreview(null);
            return;
        }

        const previewUrl = URL.createObjectURL(image);
        setImagePreview(previewUrl);

        return () => URL.revokeObjectURL(previewUrl);
    }, [image]);

    return (
        <DashboardLayout>
            <main className="min-h-screen bg-brand-white px-8 py-8">

                {/* Celular */}
                <section className="lg:hidden">
                    <div className="flex items-center gap-2">
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-2 text-brand-mint-dark"
                        >
                            <HiArrowLeft className="h-6 w-6" />

                            <span className="text-[32px] font-bold">
                                Platillo simple
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Aquí va el form de platillo simple pero en celular */}
                        <form>
                            {/* Input image*/}
                            <label
                                htmlFor="image"
                                className="flex h-48 w-full cursor-pointer items-center justify-center rounded-2xl bg-brand-mint-dark transition hover:opacity-90 mt-6"
                            >
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Vista previa del platillo"
                                        className="h-full w-full rounded-2xl object-cover"
                                    />
                                ) : (
                                    <FiCamera className="h-20 w-20 text-white" />
                                )}
                            </label>
                            <input
                                id="image"
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(event) => {
                                    const file = event.target.files?.[0];

                                    if (file) {
                                        setImage(file);
                                    }
                                }}
                            />
                            {/* Input name*/}
                            <input
                                id="name"
                                type="text"
                                placeholder="Nombre"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                className="mt-5 w-full text-brand-mint-darker font-bold rounded-lg border border-border px-2 py-1.5 "
                            />

                            {/* Input Description*/}
                            <input
                                id="description"
                                type="text"
                                placeholder="Descripción del platillo"
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                className="mt-5 w-full text-brand-mint-darker font-bold rounded-lg border border-border px-4 py-4"
                            />

                            {/* Input Price*/}
                            <input
                                id="price"
                                type="number"
                                placeholder="Precio del platillo"
                                value={price}
                                onChange={(event) => setPrice(event.target.value)}
                                className="mt-5 w-full text-brand-mint-darker font-bold rounded-lg border border-border px-4 py-1.5"
                            />

                            {/* Input Category son varias en formato desplegable*/}
                            <select
                                id="category"
                                value={category}
                                onChange={(event) => setCategory(event.target.value)}
                                className="mt-5 w-full text-brand-mint-darker font-bold rounded-lg border border-border px-4 py-1.5"
                            >
                                <option value="">Categoría</option>
                                <option value="Entradas">Postres</option>
                                <option value="Platos fuertes">Bebidas</option>
                                <option value="Postres">Café</option>
                                <option value="Bebidas">Salados</option>
                                <option value="Bebidas">Almuerzos</option>
                            </select>

                            {/* Input Discount*/}
                            <input
                                id="discount"
                                type="number"
                                placeholder="Descuento del platillo (opcional)"
                                value={discount}
                                onChange={(event) => setDiscount(event.target.value ? Number(event.target.value) : "")}
                                className="mt-5 w-full text-brand-mint-darker font-bold rounded-lg border border-border px-4 py-1.5"
                            />
                            
                            <Link
                            to="/MenuManagment"
                            className="mt-10 flex w-full cursor-pointer items-center justify-center rounded-lg border text-brand-mint-darker border-brand-mint-darker px-4 py-3 font-bold"
                        >
                          Cancelar
                        </Link>

                            <button
                            type="submit"
                            className="mt-6 w-full cursor-pointer rounded-lg bg-brand-mint-dark px-4 py-3 text-white font-bold"
                        >
                           Guardar cambios
                        </button>
                        </form>

                    </div>
                </section>

                {/* Computadora */}

                <section className="hidden lg:block">

                    <div className="rounded-2xl bg-brand-mint-dark px-8 py-6">
                        <h1 className="text-3xl font-bold text-white">
                            Hola, {firstName + "!" || "Usuario !"}
                        </h1>
                    </div>

                    <h2 className="mt-8 text-2xl font-bold text-black">
                        Menú
                    </h2>

                    <div className="mt-6 flex gap-4">

                        <Link
                            to="/simpleDishForm"
                            className="flex items-center justify-between gap-8 rounded-lg border border-border px-5 py-3"
                        >
                            <span className="text-base font-bold text-text-primary">
                                Añadir un platillo simple
                            </span>

                            <GoPlus className="h-6 w-6 shrink-0 text-brand-mint-dark" />
                        </Link>

                        <Link
                            to="/customDishForm"
                            className="flex items-center justify-between gap-8 rounded-lg border border-border px-5 py-3"
                        >
                            <span className="text-base font-bold text-text-primary">
                                Añadir un platillo personalizado
                            </span>

                            <GoPlus className="h-6 w-6 shrink-0 text-brand-mint-dark" />
                        </Link>

                    </div>

                    <h2 className="mt-8 text-2xl font-bold text-black">
                        Platillo Simple
                    </h2>

                    {/*Form platillo simple*/}
                    <form className="mt-6 grid max-w-5xl grid-cols-[280px_minmax(0,1fr)] gap-10">
                        <div>
                            <label
                                htmlFor="image"
                                className="flex h-72 w-full cursor-pointer items-center justify-center rounded-2xl bg-brand-mint-dark transition hover:opacity-90"
                            >
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Vista previa del platillo"
                                        className="h-full w-full rounded-2xl object-cover"
                                    />
                                ) : (
                                    <FiCamera className="h-20 w-20 text-white" />
                                )}
                            </label>
                            <input
                                id="image"
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(event) => {
                                    const file = event.target.files?.[0];

                                    if (file) setImage(file);
                                }}
                            />
                        </div>

                        <div className="flex flex-col gap-4">
                            <input
                                id="name"
                                type="text"
                                placeholder="Nombre"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                className="w-full text-brand-mint-darker font-bold rounded-lg border border-border px-4 py-1.5 focus:border-2 focus:border-brand-brown focus:outline-none"
                            />
                            <input
                                id="description"
                                placeholder="Descripcion del platillo"
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                className="w-full text-brand-mint-darker font-bold resize-none rounded-lg border border-border px-4 py-4 focus:border-2 focus:border-brand-brown focus:outline-none"
                            />
                            <input
                                id="price"
                                type="number"
                                placeholder="Precio del platillo"
                                value={price}
                                onChange={(event) => setPrice(event.target.value)}
                                className="w-full text-brand-mint-darker font-bold rounded-lg border border-border px-4 py-1.5 focus:border-2 focus:border-brand-brown focus:outline-none"
                            />
                            <select
                                id="category"
                                value={category}
                                onChange={(event) => setCategory(event.target.value)}
                                className="w-full text-brand-mint-darker font-bold rounded-lg border border-border px-4 py-1.5 focus:border-2 focus:border-brand-brown focus:outline-none"
                            >
                                 <option value="">Categoría</option>
                                <option value="Entradas">Postres</option>
                                <option value="Platos fuertes">Bebidas</option>
                                <option value="Postres">Café</option>
                                <option value="Bebidas">Salados</option>
                                <option value="Bebidas">Almuerzos</option>
                            </select>

                            <input
                                id="discount"
                                type="number"
                                placeholder="Descuento del platillo (opcional)"
                                value={discount}
                                onChange={(event) => setDiscount(event.target.value ? Number(event.target.value) : "")}
                                className="w-full text-brand-mint-darker font-bold rounded-lg border border-border px-4 py-1.5 focus:border-2 focus:border-brand-brown focus:outline-none"
                            />

                            <div className="mt-6 flex flex-col items-end gap-4">
                                <Link
                                    to="/menuManagment"
                                    className="flex w-90 items-center justify-center rounded-lg border border-brand-mint-dark px-4 py-3 text-brand-mint-dark transition hover:bg-brand-mint-dark/10"
                                >
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    className="w-90 cursor-pointer rounded-lg bg-brand-mint-dark px-4 py-3 text-white transition hover:bg-brand-mint-dark/90"
                                >
                                    Guardar cambios
                                </button>
                            </div>
                        </div>
                    </form>

                </section>

            </main>
        </DashboardLayout>
    );
}







export default SimpleDishForm;
