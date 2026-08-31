import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getProfile } from "../../services/authService";
import { createCustomDish } from "../../services/productService";
import { HiArrowLeft } from "react-icons/hi";
import { GoPlus } from "react-icons/go";
import { FiCamera } from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout";

function CustomDishForm() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [discount, setDiscount] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firstName, setFirstName] = useState("");

  const [optionGroups, setOptionGroups] = useState<
    { id: string; name: string; options: string[] }[]
  >([]);

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

      const data = await createCustomDish({
        name: name.trim(),
        description: description.trim(),
        price,
        discount,
        categoryId: Number(category),
        image,
        optionGroups,
      });

      console.log("Platillo personalizado creado:", data);
      alert("Platillo guardado correctamente");

      setName("");
      setDescription("");
      setPrice("");
      setCategory("");
      setDiscount("");
      setImage(null);
      setImagePreview(null);
      setOptionGroups([]);
    } catch (error) {
      console.error("Error al crear el platillo:", error);
      const apiError = error as { message?: string };
      alert(apiError.message ?? "No se pudo guardar el platillo");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                Platillo personalizado
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Aquí va el form de platillo simple pero en celular */}
            <form className="w-full" onSubmit={handleSubmit}>
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
                  if (file) setImage(file);
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
                className="mt-5 w-full text-brand-mint-darker font-bold rounded-lg border border-border px-4 py-1.5"
              />

              {/* grupos de opciones */}
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-brand-mint-darker">
                    Grupos de opciones
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setOptionGroups((prev) => [
                        ...prev,
                        { id: crypto.randomUUID(), name: "", options: [] },
                      ]);
                    }}
                    className="flex items-center gap-3 text-base font-bold border border-border rounded-lg py-1.5 px-4   text-brand-mint-darker  hover:border-brand-mint-dark my-5"
                  >
                    Agregar grupo <GoPlus className="h-4 w-4" />
                  </button>
                </div>

                {optionGroups.map((group) => (
                  <div key={group.id} className="mt-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Nombre del grupo (ej. Guarnición)"
                        value={group.name}
                        onChange={(event) => {
                          const newName = event.target.value;
                          setOptionGroups((prev) =>
                            prev.map((g) =>
                              g.id === group.id ? { ...g, name: newName } : g,
                            ),
                          );
                        }}
                        className="w-full text-brand-mint-darker font-bold rounded-lg border border-border px-4 py-1.5"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setOptionGroups((prev) =>
                            prev.filter((g) => g.id !== group.id),
                          );
                        }}
                        className="shrink-0 text-red-400"
                        aria-label="Eliminar grupo"
                      >
                        ✕
                      </button>
                    </div>

                    {group.name.trim() !== "" && (
                      <div className="mt-2">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setOptionGroups((prev) =>
                                prev.map((g) =>
                                  g.id === group.id
                                    ? { ...g, options: [...g.options, ""] }
                                    : g,
                                ),
                              );
                            }}
                            className="flex items-center gap-3 text-base font-bold border border-border rounded-lg py-1.5 px-4   text-brand-mint-darker  hover:border-brand-mint-dark my-5"
                          >
                            Agregar opcion +
                          </button>
                        </div>

                        {group.options.map((option, index) => (
                          <div
                            key={index}
                            className="mt-2 flex items-center gap-2"
                          >
                            <input
                              type="text"
                              placeholder={`Opción ${index + 1}`}
                              value={option}
                              onChange={(event) => {
                                const newValue = event.target.value;
                                setOptionGroups((prev) =>
                                  prev.map((g) =>
                                    g.id === group.id
                                      ? {
                                          ...g,
                                          options: g.options.map((o, i) =>
                                            i === index ? newValue : o,
                                          ),
                                        }
                                      : g,
                                  ),
                                );
                              }}
                              className="w-full text-brand-mint-darker font-bold rounded-lg border border-border px-4 py-1.5"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setOptionGroups((prev) =>
                                  prev.map((g) =>
                                    g.id === group.id
                                      ? {
                                          ...g,
                                          options: g.options.filter(
                                            (_, i) => i !== index,
                                          ),
                                        }
                                      : g,
                                  ),
                                );
                              }}
                              className="shrink-0 text-red-400"
                              aria-label="Eliminar opción"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Link
                to="/MenuManagment"
                className="mt-10 flex w-full cursor-pointer items-center justify-center rounded-lg border text-brand-mint-darker border-brand-mint-darker px-4 py-3 font-bold"
              >
                Cancelar
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 w-full cursor-pointer rounded-lg bg-brand-mint-dark px-4 py-3 text-white font-bold disabled:opacity-50"
              >
                {isSubmitting ? "Guardando..." : "Guardar cambios"}
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

          <h2 className="mt-8 text-2xl font-bold text-black">Menú</h2>

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
            Platillo Personalizado
          </h2>

          {/*Form platillo simple*/}
          <form
            onSubmit={handleSubmit}
            className="mt-6 grid max-w-5xl grid-cols-[280px_minmax(0,1fr)] gap-10"
          >
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
                className="w-full text-brand-mint-darker font-bold rounded-lg border border-border px-4 py-1.5 focus:border-2 focus:border-brand-brown focus:outline-none"
              />

              {/* grupos de opciones */}

              <div>
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-brand-mint-darker">
                      Grupos de opciones
                    </h3>

                    <button
                      type="button"
                      onClick={() => {
                        setOptionGroups((prev) => [
                          ...prev,
                          { id: crypto.randomUUID(), name: "", options: [] },
                        ]);
                      }}
                      className="flex items-center gap-3 text-base font-bold border border-border rounded-lg py-1.5 px-3   text-brand-mint-darker  hover:border-brand-mint-dark my-5"
                    >
                      {" "}
                      Agregar grupo <GoPlus className="h-4 w-4" />
                    </button>
                  </div>

                  {optionGroups.map((group) => (
                    <div key={group.id} className="mt-4 rounded-lg  p-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Nombre del grupo (ej.Guarnición)"
                          value={group.name}
                          onChange={(event) => {
                            const newName = event.target.value;
                            setOptionGroups((prev) =>
                              prev.map((g) =>
                                g.id === group.id ? { ...g, name: newName } : g,
                              ),
                            );
                          }}
                          className="w-full text-brand-mint-darker font-bold rounded-lg border border-border px-4 py-1.5"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            setOptionGroups((prev) =>
                              prev.filter((g) => g.id !== group.id),
                            );
                          }}
                          className="shrink-0  text-red-400 "
                          aria-label="Eliminar grupo"
                        >
                          ✕
                        </button>
                      </div>

                      {/* opciones del grupo */}

                      {group.name.trim() !== "" && (
                        <div className="mt-3">
                          {group.options.map((option, index) => (
                            <div
                              key={index}
                              className="mt-5 flex items-center gap-50"
                            >
                              <input
                                type="text"
                                placeholder={`Opción ${index + 1}`}
                                value={option}
                                onChange={(event) => {
                                  const newValue = event.target.value;
                                  setOptionGroups((prev) =>
                                    prev.map((g) =>
                                      g.id === group.id
                                        ? {
                                            ...g,
                                            options: g.options.map((o, i) =>
                                              i === index ? newValue : o,
                                            ),
                                          }
                                        : g,
                                    ),
                                  );
                                }}
                                className="w-full text-brand-mint-darker font-bold rounded-lg border border-border px-4 py-1.5"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setOptionGroups((prev) =>
                                    prev.map((g) =>
                                      g.id === group.id
                                        ? {
                                            ...g,
                                            options: g.options.filter(
                                              (_, i) => i !== index,
                                            ),
                                          }
                                        : g,
                                    ),
                                  );
                                }}
                                className="shrink-0 text-red-400 "
                                aria-label="Eliminar opción"
                              >
                                ✕
                              </button>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => {
                              setOptionGroups((prev) =>
                                prev.map((g) =>
                                  g.id === group.id
                                    ? { ...g, options: [...g.options, ""] }
                                    : g,
                                ),
                              );
                            }}
                            className="flex items-center gap-3 text-base font-bold border border-border rounded-lg py-1.5 px-4   text-brand-mint-darker  hover:border-brand-mint-dark my-5"
                          >
                            Agregar opción <GoPlus className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-col items-end gap-4">
                <Link
                  to="/menuManagment"
                  className="flex w-90 items-center justify-center rounded-lg border border-brand-mint-dark px-4 py-3 text-brand-mint-dark transition hover:bg-brand-mint-dark/10"
                >
                  Cancelar
                </Link>

                {/* boton solo permite una subida de daros por tasnto de la imagen un solo paso mientras llega  a la bd */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-90 cursor-pointer rounded-lg bg-brand-mint-dark px-4 py-3 text-white transition hover:bg-brand-mint-dark/90 disabled:opacity-50" >
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

export default CustomDishForm;
