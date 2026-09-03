import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getProfile } from "../../services/authService";
import { HiArrowLeft } from "react-icons/hi";
import { GoPlus } from "react-icons/go";
import { FiCamera } from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {createProduct,getProductById,updateProduct,} from "../../services/productService";

interface SimpleDishFormProps {
  mode?: "create" | "edit";
  productId?: number;
}

function SimpleDishForm({ mode = "create", productId }: SimpleDishFormProps) {
	const navigate = useNavigate();
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [discount, setDiscount] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const isEditMode = mode === "edit" && Boolean(productId);

  {
    /* useEffect para cargar el nombre del usuario */
  }
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

  {
    /* useEffect para actualizar la vista previa de la imagen */
  }
  useEffect(() => {
    if (!image) {
      setImagePreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(image);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [image]);

  useEffect(() => {
    if (!isEditMode || !productId) {
      return;
    }

    const loadProduct = async () => {
      try {
        const product = await getProductById(productId);
        setName(product.productName ?? "");
        setDescription(product.description ?? "");
        setPrice(String(product.price ?? ""));
        setCategory(String(product.categoryId ?? ""));
        setImagePreview(product.image ?? null);
        setImage(null);
      } catch (error) {
        console.error("Error loading product to edit:", error);
        alert("No se pudo cargar la información del platillo");
      }
    };

    loadProduct();
  }, [isEditMode, productId]);

  {
    /* Manejo del envío del formulario */
  }
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      alert("Ingresa el nombre del platillo");
      return;
    }

    if (!price) {
      alert("Ingresa el precio del platillo");
      return;
    }

    if (!category) {
      alert("Selecciona una categoría");
      return;
    }

    try {
      setIsSubmitting(true);

      
      if (isEditMode && productId) {
        const data = await updateProduct(productId, {
          name: name.trim(),
          description: description.trim(),
          price,
          discount,
          categoryId: Number(category),
          image,
        });

        console.log("Producto actualizado:", data);
        setSuccessMessage("Platillo actualizado correctamente");
        return;
      }

      const data = await createProduct({
        name: name.trim(),
        description: description.trim(),
        price,
        discount,
        categoryId: Number(category),
        image,
      });

      console.log("Producto creado:", data);

      setSuccessMessage("Platillo guardado correctamente");

      // Limpiar formulario
      setName("");
      setDescription("");
      setPrice("");
      setCategory("");
      setDiscount("");
      setImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error al guardar el platillo:", error);

      const apiError = error as {
        message?: string;
      };

      alert(apiError.message ?? "No se pudo guardar el platillo");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
		{successMessage && (
			<div
				className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
				role="dialog"
				aria-modal="true"
				aria-labelledby="success-dialog-title"
			>
				<div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
					<h2 id="success-dialog-title" className="text-lg font-bold text-mint-darker">
						¡Listo!
					</h2>
					<p className="mt-2 text-sm text-text-primary">{successMessage}</p>
					<button
						type="button"
						onClick={() => navigate({ to: "/menuManagment" })}
						className="mt-6 cursor-pointer rounded-lg bg-mint-dark px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
					>
						Aceptar
					</button>
				</div>
			</div>
		)}
      <main className="min-h-screen bg-brand-white px-8 py-8">
        {/* Celular */}
        <section className="lg:hidden">
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-mint-dark"
            >
              <HiArrowLeft className="h-6 w-6" />

              <span className="text-[32px] font-bold">Platillo simple</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Aquí va el form de platillo simple pero en celular */}
            <form onSubmit={handleSubmit}>
              {/* Input image*/}
              <label
                htmlFor="image"
                className="flex h-48 w-full cursor-pointer items-center justify-center rounded-2xl bg-mint-dark transition hover:opacity-90 mt-6"
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
                className="mt-5 w-full text-mint-darker font-bold rounded-lg border border-border px-2 py-1.5 "
              />

              {/* Input Description*/}
              <input
                id="description"
                type="text"
                placeholder="Descripción del platillo"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="mt-5 w-full text-mint-darker font-bold rounded-lg border border-border px-4 py-4"
              />

              {/* Input Price*/}
              <input
                id="price"
                type="number"
                placeholder="Precio del platillo"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className="mt-5 w-full text-mint-darker font-bold rounded-lg border border-border px-4 py-1.5"
              />

              {/* Input Category son varias en formato desplegable*/}
              <select
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full mt-5 text-mint-darker font-bold rounded-lg border border-border px-4 py-1.5 focus:border-2 focus:border-brown focus:outline-none"
              >
                <option value="">Categoría</option>

                <option value="1">Postres</option>
                <option value="2">Bebidas</option>
                <option value="3">Café</option>
                <option value="4">Salados</option>
                <option value="5">Almuerzos</option>
              </select>

              {/* Input Discount*/}
              <input
                id="discount"
                type="number"
                placeholder="Descuento del platillo (opcional)"
                value={discount}
                onChange={(event) =>
                  setDiscount(
                    event.target.value ? Number(event.target.value) : "",
                  )
                }
                className="mt-5 w-full text-mint-darker font-bold rounded-lg border border-border px-4 py-1.5"
              />

              <Link
                to="/MenuManagment"
                className="mt-10 flex w-full cursor-pointer items-center justify-center rounded-lg border text-mint-darker border-mint-darker px-4 py-3 font-bold"
              >
                Cancelar
              </Link>

  {/* Cambio:boton solo permite una subida de daros por tasnto de la imagen un solo paso mientras llega  a la bd */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 w-full cursor-pointer rounded-lg bg-mint-dark px-4 py-3 text-white font-bold disabled:opacity-50"
              >
                {isSubmitting ? "Guardando..." : "Guardar cambios"}
              </button>


            </form>
          </div>
        </section>

        {/* Computadora */}

        <section className="hidden lg:block">
          <div className="rounded-2xl bg-mint-dark px-8 py-6">
            <h1 className="text-3xl font-bold text-white">
              Hola, {firstName + "!" || "Usuario !"}
            </h1>
          </div>

          <h2 className="mt-8 text-2xl font-bold text-black">
            {isEditMode ? "Editar platillo" : "Menú"}
          </h2>

          <div className="mt-6 flex gap-4">
            <Link
              to="/simpleDishForm"
              className="flex items-center justify-between gap-8 rounded-lg border border-border px-5 py-3"
            >
              <span className="text-base font-bold text-text-primary">
                Añadir un platillo simple
              </span>

              <GoPlus className="h-6 w-6 shrink-0 text-mint-dark" />
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
            {isEditMode ? "Platillo Simple - Editar" : "Platillo Simple"}
          </h2>

          {/*Form platillo simple*/}
          <form
            onSubmit={handleSubmit}
            className="mt-6 grid max-w-5xl grid-cols-[280px_minmax(0,1fr)] gap-10"
          >
            <div>
              <label
                htmlFor="image"
                className="flex h-72 w-full cursor-pointer items-center justify-center rounded-2xl bg-mint-dark transition hover:opacity-90"
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
                className="w-full text-mint-darker font-bold rounded-lg border border-border px-4 py-1.5 focus:border-2 focus:border-brown focus:outline-none"
              />
              <input
                id="description"
                placeholder="Descripcion del platillo"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full text-mint-darker font-bold resize-none rounded-lg border border-border px-4 py-4 focus:border-2 focus:border-brown focus:outline-none"
              />
              <input
                id="price"
                type="number"
                placeholder="Precio del platillo"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className="w-full text-mint-darker font-bold rounded-lg border border-border px-4 py-1.5 focus:border-2 focus:border-brown focus:outline-none"
              />
              <select
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full text-mint-darker font-bold rounded-lg border border-border px-4 py-1.5 focus:border-2 focus:border-brown focus:outline-none"
              >

                <option value="">Categoría</option>
                <option value="1">Postres</option>
                <option value="2">Bebidas</option>
                <option value="3">Café</option>
                <option value="4">Salados</option>
                <option value="5">Almuerzos</option>
              </select>

              <input
                id="discount"
                type="number"
                placeholder="Descuento del platillo (opcional)"
                value={discount}
                onChange={(event) =>
                  setDiscount(
                    event.target.value ? Number(event.target.value) : "",
                  )
                }
                className="w-full text-mint-darker font-bold rounded-lg border border-border px-4 py-1.5 focus:border-2 focus:border-brown focus:outline-none"
              />

              <div className="mt-6 flex flex-col items-end gap-4">
                <Link
                  to="/menuManagment"
                  className="flex w-90 items-center justify-center rounded-lg border border-mint-dark px-4 py-3 text-mint-dark transition hover:bg-mint-dark/10"
                >
                  Cancelar
                </Link>


{/* Cambio:boton solo permite una subida de daros por tasnto de la imagen un solo paso mientras llega  a la bd se agrego el [isSubmitting setIsSubmitting]*/}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-90 cursor-pointer rounded-lg bg-mint-dark px-4 py-3 text-white font-bold disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : "Guardar cambios"}
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
