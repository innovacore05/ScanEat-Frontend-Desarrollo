import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getProfile, getStoredFirstName } from "../../services/authService";
import {
  createCustomDish,
  getProductById,
  updateCustomDish,
  getCategories,
  searchCabys,
  getFiscalOptions,
  type Category,
  type FiscalOption,
  type CabysSearchResult,

} from "../../services/productService";
import { HiArrowLeft } from "react-icons/hi";
import { GoPlus } from "react-icons/go";
import { FiCamera } from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout";

interface CustomDishFormProps {
  mode?: "create" | "edit";
  productId?: number;
}

function CustomDishForm({ mode = "create", productId }: CustomDishFormProps) {
  const isEditMode = mode === "edit" && Boolean(productId);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");

  //cabys
  const [categories, setCategories] = useState<Category[]>([]);
  const [cabysCode, setCabysCode] = useState("");
  const [fiscalOptions, setFiscalOptions] = useState<FiscalOption[]>([]);

  //cabys: busqueda escrita (productos empacados)
  const [cabysQuery, setCabysQuery] = useState("");
  const [cabysResults, setCabysResults] = useState<CabysSearchResult[]>([]);
  const [cabysLabel, setCabysLabel] = useState("");


  const [discount, setDiscount] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [firstName, setFirstName] = useState(getStoredFirstName);
  const [error, setError] = useState("");


  const [optionGroups, setOptionGroups] = useState<
    { id: string; name: string; options: string[] }[]
  >([]);


  //obtener categoria elegida y familia
  const selectedCategory = categories.find(
    (cat) => String(cat.categoryId) === category,
  );
  const usesSearch = selectedCategory?.fiscalType === "packaged";



  const resetCabys = () => {
    setCabysCode("");
    setCabysLabel("");
    setCabysQuery("");
    setCabysResults([]);
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
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };

    loadCategories();
  }, []);

  //cabys
  useEffect(() => {
    setFiscalOptions([]);

    if (!selectedCategory?.fiscalType ||
      selectedCategory.fiscalType === "dishes" ||
      selectedCategory.fiscalType === "packaged") {
      return;
    }

    let cancelled = false;

    getFiscalOptions(selectedCategory.fiscalType)
      .then((options) => {
        if (!cancelled) {
          setFiscalOptions(options);
        }
      })
      .catch((error) => {
        console.error("Error al cargar opciones CABYS:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCategory?.categoryId, selectedCategory?.fiscalType]);


  //cabys: busqueda con retraso mientras escribe (empacados)
  useEffect(() => {
    if (!usesSearch || cabysQuery.trim().length < 3) {
      setCabysResults([]);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      searchCabys(cabysQuery.trim(), "packaged")
        .then((results) => {
          if (!cancelled) setCabysResults(results);
        })
        .catch((error) => console.error("Error buscando CABYS:", error));
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [cabysQuery, usesSearch]);



  //cabys: al editar, mostrar el nombre del codigo ya guardado
  useEffect(() => {
    if (!usesSearch || !cabysCode || cabysLabel) return;

    searchCabys(cabysCode, "packaged")
      .then((results) => {
        const hit = results.find((r) => r.code === cabysCode);
        if (hit) setCabysLabel(hit.label);
      })
      .catch((error) => console.error("Error cargando CABYS:", error));
  }, [usesSearch, cabysCode, cabysLabel]);

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
        setCabysCode(product.cabysCode ?? "");
        setDiscount(
          product.discount !== undefined && product.discount !== null
            ? Number(product.discount)
            : "",
        );
        setImagePreview(product.image ?? null);
        setImage(null);
        setOptionGroups(product.optionGroups ?? []);
      } catch (error) {
        console.error("Error loading custom product to edit:", error);
        alert("No se pudo cargar la información del platillo personalizado");
      }
    };

    loadProduct();
  }, [isEditMode, productId]);

  useEffect(() => {
    if (!image) {
      if (!isEditMode) {
        setImagePreview(null);
      }
      return;
    }

    const previewUrl = URL.createObjectURL(image);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [image]);


  //selector de cabys / aviso
  const renderCabysField = () => {
    if (!selectedCategory) {
      return null;
    }

    if (!selectedCategory.fiscalType) {
      return (
        <p className="mt-3 text-sm text-red-600">
          Esta categoría no tiene una familia fiscal configurada.
        </p>
      );
    }

    if (selectedCategory.fiscalType === "dishes") {
      return (
        <p className="mt-3 text-sm text-gray-600">
          El código CABYS se asignará automáticamente.
        </p>
      );
    }


    //empacados: búsqueda escrita
    if (usesSearch) {
      return (
        <div className="mt-3">
          <label className="mb-1 block text-sm font-medium text-text-primary">
            ¿Qué producto es?
          </label>

          {cabysCode ? (
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-2">
              <span className="text-sm text-text-primary">
                {cabysLabel || "Producto seleccionado"}
              </span>
              <button
                type="button"
                className="text-sm font-bold text-mint-darker"
                onClick={resetCabys}
              >
                Cambiar
              </button>
            </div>
          ) : (
            <>
              <input
                type="text"
                value={cabysQuery}
                onChange={(event) => setCabysQuery(event.target.value)}
                placeholder="Buscá: chicles, papas, galletas..."
                className="w-full rounded-lg border border-border px-4 py-2 focus:border-2 focus:border-brown focus:outline-none"
              />

              {cabysResults.length > 0 && (
                <ul className="mt-1 max-h-56 overflow-y-auto rounded-lg border border-border bg-white">
                  {cabysResults.map((result) => (
                    <li key={result.code}>
                      <button
                        type="button"
                        className="w-full px-4 py-2 text-left text-sm hover:bg-mint-dark/10"
                        onClick={() => {
                          setCabysCode(result.code);
                          setCabysLabel(result.label);
                          setCabysResults([]);
                        }}
                      >
                        {result.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {cabysQuery.trim().length >= 3 && cabysResults.length === 0 && (
                <p className="mt-2 text-sm text-gray-600">Sin resultados.</p>
              )}
            </>
          )}
        </div>
      );
    }


    return (
      <div className="mt-3">
        <label className="mb-1 block text-sm font-medium text-text-primary">
          Opción CABYS
        </label>

        <select
          value={cabysCode}
          onChange={(event) => setCabysCode(event.target.value)}
          className="w-full rounded-lg border border-border px-4 py-2 focus:border-2 focus:border-brown focus:outline-none"
        >
          <option value="">Selecciona una opción CABYS</option>

          {fiscalOptions.map((option) => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>

        {fiscalOptions.length === 0 && (
          <p className="mt-2 text-sm text-gray-600">
            No hay opciones CABYS activas para esta familia.
          </p>
        )}
      </div>
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Ingresa el nombre del platillo");
      return;
    }
    if (!description.trim()) {
      setError("Ingresa la descripción del platillo");
      return;
    }
    if (!price) {
      setError("Ingresa el precio del platillo");
      return;
    }
    if (isNaN(Number(price)) || Number(price) <= 0) {
      setError("Ingresa un precio válido");
      return;
    }
    if (
      discount !== "" &&
      (!Number.isFinite(Number(discount)) ||
        Number(discount) < 0 ||
         Number(discount) >= 100)
    ) {
      setError("El descuento debe estar entre 1 % y 90 %");
      return;
    }
    if (!category) {
      setError("Selecciona una categoría");
      return;
    }

    //cabys
    if (!selectedCategory?.fiscalType) {
      setError("La categoría seleccionada no tiene familia fiscal configurada");
      return;
    }

    if (selectedCategory.fiscalType !== "dishes" && !cabysCode) {
      setError(
        usesSearch
          ? "Busca y selecciona qué producto es"
          : "Selecciona una opción CABYS",
      );
      return;
    }


    if (optionGroups.length === 0) {
      setError("Ingresa al menos un grupo de opciones");
      return;
    }
    if (optionGroups.some((group) => !group.name.trim())) {
      setError("Todos los grupos de opciones deben tener un nombre");
      return;
    }
    if (optionGroups.some((group) => group.options.length === 0)) {
      setError("Todos los grupos de opciones deben tener al menos una opción");
      return;
    }
    if (optionGroups.some((group) => group.options.some((option) => !option.trim()))) {
      setError("Todas las opciones deben tener un valor");
      return;
    }
    if (!image && !imagePreview) {
      setError("Selecciona una imagen para el platillo");
      return;
    }
    if (image && !["image/jpeg", "image/png", "image/webp"].includes(image.type)) {
      setError("La imagen debe ser JPG, JPEG, PNG o WEBP");
      return;
    }


    try {
      setIsSubmitting(true);

      const dishData = {
        name: name.trim(),
        description: description.trim(),
        price,
        discount,
        categoryId: Number(category),
        image,
        cabysCode,
        optionGroups,
      };
      const data = isEditMode && productId
        ? await updateCustomDish(productId, dishData)
        : await createCustomDish(dishData);

      console.log(
        isEditMode
          ? "Platillo personalizado actualizado:"
          : "Platillo personalizado creado:",
        data,
      );
      setSuccessMessage(
        isEditMode
          ? "Platillo actualizado correctamente"
          : "Platillo guardado correctamente",
      );

      if (!isEditMode) {
        setName("");
        setDescription("");
        setPrice("");
        setCategory("");
        resetCabys();
        setDiscount("");
        setImage(null);
        setImagePreview(null);
        setOptionGroups([]);
      }
    } catch (error) {
      console.error(
        isEditMode
          ? "Error al actualizar el platillo:"
          : "Error al crear el platillo:",
        error,
      );
      const apiError = error as { message?: string };
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
              onClick={() => setSuccessMessage(null)}
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

              <span className="text-[32px] font-bold">
                {isEditMode
                  ? "Editar platillo"
                  : "Platillo personalizado"}
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Aquí va el form de platillo simple pero en celular */}
            <form className="w-full" onSubmit={handleSubmit}>
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
                className="mt-5 w-full font-normal text-black text-base rounded-lg border border-border focus:border-2 focus:border-brown focus:outline-none px-4 py-1.5 "
              />

              {/* Input Description*/}
              <input
                id="description"
                type="text"
                placeholder="Descripción del platillo"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="mt-5 w-full font-normal text-black text-base rounded-lg border border-border focus:border-2 focus:border-brown focus:outline-none px-4 py-1.5"
              />

              {/* Input Price*/}
              <input
                id="price"
                type="number"
                placeholder="Precio del platillo"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className="mt-5 w-full font-normal text-black text-base rounded-lg border border-border focus:border-2 focus:border-brown focus:outline-none px-4 py-1.5"
              />

              {/* Input Category son varias en formato desplegable*/}
              <select
                id="category"
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  resetCabys();
                }}

                className="mt-5 w-full font-normal text-black text-base rounded-lg border border-border focus:border-2 focus:border-brown focus:outline-none px-3 py-1.5"
              >
                <option value="">Categoría</option>

                {categories.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {renderCabysField()}
              {/* Input Discount*/}
              <div className="relative mt-5">
                <input
                  id="discount"
                  type="number"
                  placeholder="Descuento del platillo"
                  value={discount}
                  onChange={(event) =>
                    setDiscount(event.target.value ? Number(event.target.value) : "")
                  }
                  className="w-full font-normal text-black text-base rounded-lg border border-border px-4 py-1.5 pr-10 focus:border-2 focus:border-brown focus:outline-none"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-base font-black text-black">
                  %
                </span>
              </div>

              {/* grupos de opciones */}
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-mint-darker text-lg">
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
                    className="flex items-center gap-3 text-base font-bold border border-border rounded-lg py-1.5 px-4   text-mint-darker  hover:border-mint-dark my-5"
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
                        className="mt-5 w-full font-normal text-black text-base rounded-lg border border-border focus:border-2 focus:border-brown focus:outline-none px-4 py-1.5"
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
                              className="mt-5 w-full font-normal text-black text-base rounded-lg border border-border focus:border-2 focus:border-brown focus:outline-none px-4 py-1.5"
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
                          className="flex items-center gap-3 text-base font-bold border border-border rounded-lg py-1.5 px-4   text-mint-darker  hover:border-mint-dark my-5 mb-10"
                        >
                          Agregar opcion +
                        </button>
                      </div>


                    )}
                  </div>
                ))}
              </div>
              {error ? (
                <p className="text-sm text-red-600">{error}</p>
              ) : null}

              <Link
                to="/MenuManagment"
                className="mt-10 flex w-full cursor-pointer items-center justify-center rounded-lg border text-mint-darker border-mint-darker px-4 py-3 font-bold"
              >
                Cancelar
              </Link>

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

          <h2 className="mt-8 text-2xl font-bold text-black">Menú</h2>

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

              <GoPlus className="h-6 w-6 shrink-0 text-mint-dark" />
            </Link>
          </div>

          <h2 className="mt-8 text-2xl font-bold text-black">
            {isEditMode
              ? "Platillo Personalizado - Editar"
              : "Platillo Personalizado"}
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
                className="w-full font-normal text-black text-base rounded-lg border border-border px-4 py-1.5 focus:border-2 focus:border-brown focus:outline-none"
              />

              <input
                id="description"
                placeholder="Descripcion del platillo"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full font-normal text-black text-base rounded-lg border border-border px-4 py-4 focus:border-2 focus:border-brown focus:outline-none"
              />

              <input
                id="price"
                type="number"
                placeholder="Precio del platillo"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className="w-full font-normal text-black text-base rounded-lg border border-border px-4 py-1.5 focus:border-2 focus:border-brown focus:outline-none"
              />

              <select
                id="category"
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  resetCabys();
                }}
                className="w-full font-normal text-black text-base rounded-lg border border-border px-4 py-1.5 focus:border-2 focus:border-brown focus:outline-none"
              >
                <option value="">Categoría</option>
                {categories.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.name}
                  </option>
                ))}
              </select>


              {renderCabysField()}


              <div className="relative">
                <input
                  id="discount"
                  type="number"
                  placeholder="Descuento del platillo"
                  value={discount}
                  onChange={(event) =>
                    setDiscount(event.target.value ? Number(event.target.value) : "")
                  }
                  className="w-full font-normal text-black text-base rounded-lg border border-border px-4 py-1.5 pr-10 focus:border-2 focus:border-brown focus:outline-none"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-base font-black text-black">
                  %
                </span>
              </div>
              {/* grupos de opciones */}

              <div>
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-mint-darker text-lg">
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
                      className="flex items-center gap-3 text-base font-bold border border-border rounded-lg py-1.5 px-3   text-mint-darker  hover:border-mint-dark my-5"
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
                          className="w-full font-normal text-black text-base rounded-lg border border-border px-4 py-1.5 focus:border-2 focus:border-brown focus:outline-none"
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
                                className="w-full font-normal text-black text-base rounded-lg border border-border px-4 py-1.5 focus:border-2 focus:border-brown focus:outline-none"
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
                            className="flex items-center gap-3 text-base font-bold border border-border rounded-lg py-1.5 px-3   text-mint-darker  hover:border-mint-dark my-5"
                          >
                            Agregar opción <GoPlus className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {error ? (
                <p className="text-sm text-red-600">{error}</p>
              ) : null}

              <div className="mt-6 flex flex-col items-end gap-4">
                <Link
                  to="/menuManagment"
                  className="flex w-90 items-center justify-center rounded-lg border border-mint-dark px-4 py-3 text-mint-dark transition hover:bg-mint-dark/10"
                >
                  Cancelar
                </Link>

                {/* boton solo permite una subida de daros por tasnto de la imagen un solo paso mientras llega  a la bd */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-90 cursor-pointer rounded-lg bg-mint-dark px-4 py-3 text-white transition hover:bg-mint-darker disabled:opacity-50" >
                  {isSubmitting ? "Guardando..." : "Guardar cambios"}
                </button>


              </div>
            </div>
          </form>
        </section>
      </main>
    </DashboardLayout >
  );
}

export default CustomDishForm;
