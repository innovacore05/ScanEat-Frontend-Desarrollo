import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { HiArrowLeft } from "react-icons/hi";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getCategories, type FiscalType } from "../../services/productService";
import { createCategory, updateCategory, } from "../../services/productService";
import {
   
    LuCakeSlice,
    LuSandwich,
    LuCroissant,
    LuUtensils,
    LuIceCreamBowl,
    LuSalad,
    LuBadgePercent,
    LuWine,
    LuPackage,
} from "react-icons/lu";

import {
    RiDrinks2Line,
} from "react-icons/ri";

import {
    GiCoffeeCup,
    GiKnifeFork,
    GiPizzaSlice,
    GiHamburger,
    GiHotDog,
    GiTacos,
    GiChickenLeg,
    GiSteak,
    GiDonut,
    GiChocolateBar,
} from "react-icons/gi";
import type { IconType } from "react-icons";

const CATEGORY_ICONS = [
    { key: "dessert", name: "Postres", Icon: LuCakeSlice },
    { key: "drinks", name: "Bebidas", Icon: RiDrinks2Line },
    { key: "coffee", name: "Café", Icon: GiCoffeeCup },
    { key: "sandwich", name: "Salados", Icon: LuSandwich },
    { key: "breakfast", name: "Desayunos", Icon: LuCroissant },
    { key: "lunch", name: "Almuerzos", Icon: LuUtensils },
    { key: "dinner", name: "Cenas", Icon: GiKnifeFork },
    { key: "ice_cream", name: "Helados", Icon: LuIceCreamBowl },
    { key: "pizza", name: "Pizza", Icon: GiPizzaSlice },
    { key: "burger", name: "Hamburguesas", Icon: GiHamburger },
    { key: "hotdog", name: "Hot Dogs", Icon: GiHotDog },
    { key: "tacos", name: "Tacos", Icon: GiTacos },
    { key: "chicken", name: "Pollo", Icon: GiChickenLeg },
    { key: "steak", name: "Carnes", Icon: GiSteak },
    { key: "salad", name: "Ensaladas", Icon: LuSalad },
    { key: "donut", name: "Donas", Icon: GiDonut },
    { key: "chocolate", name: "Chocolate", Icon: GiChocolateBar },
    { key: "promotion", name: "Promociones", Icon: LuBadgePercent },
];



const FISCAL_TYPES:{key:FiscalType;label:string;hint:string;Icon:IconType}[]=[
    { key: "dishes", label: "Platillos", hint: "Comida preparada: hamburguesas, casados, pizzas", Icon: LuUtensils },
    { key: "hot_drinks", label: "Bebidas calientes", hint: "Café, té, chocolate", Icon: GiCoffeeCup },
    { key: "cold_drinks", label: "Bebidas frías sin alcohol", hint: "Batidos, refrescos, jugos, agua", Icon: RiDrinks2Line },
    { key: "alcohol_drinks", label: "Bebidas con alcohol", hint: "Cerveza, licores, cócteles", Icon: LuWine },
    { key: "packaged", label: "Productos empacados", hint: "Papitas, galletas, chicles", Icon: LuPackage },
];


function CategoryForm() {

    const [name, setName] = useState("");
    const [selectedIcon, setSelectedIcon] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [loadingCategory, setLoadingCategory] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { mode, categoryId } = useSearch({
        strict: false,
    });
    const isEditMode = mode === "edit";
    const [showSuccessModal, setShowSuccessModal] = useState(false);
//nuevo
const [fiscalType,setFiscalType]=useState<FiscalType|"">("");

    const handleCreateCategory = async () => {
        setError("");

        if (!name.trim()) {
            setError("El nombre de la categoría es obligatorio");
            return;
        }

        if (!selectedIcon) {
            setError("Debes seleccionar un ícono");
            return;
        }

        if(!fiscalType)
        {
            setError("Selecciona qué vendes en esta categoría");
            return;
        }
        try {
            setIsCreating(true);

            if (isEditMode && categoryId) {
                await updateCategory({
                    categoryId,
                    name,
                    icon: selectedIcon,
                    fiscalType
                });
            } else {
                await createCategory({
                    name,
                    icon: selectedIcon,
                    fiscalType
                });
            }

            setShowSuccessModal(true);
        } catch (error) {
            console.error("Error creating category:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "No se pudo crear la categoría"
            );
        } finally {
            setIsCreating(false);
        }

        

    };

    useEffect(() => {
        if (!isEditMode || !categoryId) return;

        const loadCategory = async () => {
            try {
                setLoadingCategory(true);

                const data = await getCategories();

                const category = data.find(
                    (item) => item.categoryId === categoryId
                );

                if (!category) {
                    console.error("Categoría no encontrada");
                    return;
                }

                setName(category.name);
                setSelectedIcon(category.icon ?? "");
                setFiscalType(category.fiscalType??"");
            } catch (error) {
                console.error("Error loading category:", error);
            } finally {
                setLoadingCategory(false);
            }
        };

        loadCategory();
    }, [isEditMode, categoryId]);


    return (
        <DashboardLayout>
            <main className="min-h-screen bg-white px-8 py-8 lg:px-15 lg:py-15">
                <div className="flex items-center gap-2">
                    <Link
                        to="/categoryManagement"
                        className="flex items-center gap-2 text-mint-dark"
                    >
                        <HiArrowLeft className="h-6 w-6" />

                        <h1 className="text-[32px] font-bold">{isEditMode ? "Editar categoría" : "Crear categoría"}</h1>
                    </Link>
                </div>

                <div className="mt-8">
                    <p className="text-2xl font-bold text-text-primary">
                        {isEditMode
                            ? "Edita los detalles de la categoría"
                            : "Nueva categoría para tu menú"}
                    </p>
                    <div className="mt-6 max-w-md">
                        <input
                            id="category-name"
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Nombre de la categoría"
                            className="w-full rounded-lg border border-border px-4 py-3 outline-none focus:border-mint-dark"
                        />
                    </div>
                    <div className="mt-8 max-w-md">
                        <p className="mb-3 text-base font-bold text-text-primary">
                            Ícono de la categoría
                        </p>

                        <div className="flex flex-wrap gap-4">
                            {CATEGORY_ICONS.map(({ key, name, Icon }) => {
                                const selected = selectedIcon === key;

                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setSelectedIcon(key)}
                                        className={`flex h-16 w-16 items-center justify-center rounded-2xl text-white transition ${selected ? "bg-mint-darker" : "bg-mint-dark"
                                            }`}
                                        aria-label={name}
                                        title={name}
                                    >
                                        <Icon className="h-8 w-8" />
                                    </button>
                                );
                            })}
                        </div>


{/* nuevo para cabys */}

<div className="mt-8 mx-w-2x1">
    <p className="mb-1 text-base font-bold text-text-primary">
¿Qué vendes en esta categoría?
    </p>
    
    <p className="mb-3 text-sm text-gray-600">
 Lo usamos para facturar correctamente. Si lo cambiás después, solo afecta a ventas futuras.
    </p>

 <div role="radiogroup" aria-label="Tipo de producto" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FISCAL_TYPES.map(({ key, label, hint, Icon }) => {
            const selected = fiscalType === key;

            return (
                <button
                 key={key}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setFiscalType(key)}
                    className={`flex items-start gap-3 rounded-xl border-2 p-3 text-left transition ${
                        selected
                            ? "border-mint-dark bg-mint-dark/10"
                            : "border-border hover:border-mint-dark"
                    }`}>
 <Icon className="mt-0.5 h-6 w-6 shrink-0 text-mint-dark" />
                    <span>
                        <span className="block font-bold text-text-primary">{label}</span>
                        <span className="block text-xs text-gray-600">{hint}</span>
                    </span>
                </button>
            )
})}
</div>
</div>

                        <button
                            type="button"
                            onClick={handleCreateCategory}
                            disabled={isCreating}
                            className="mt-8 rounded-lg bg-mint-dark px-6 py-3 text-base font-bold text-white transition  hover:bg-mint-darker disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isEditMode ? "Guardar cambios" : "Crear categoría"}
                        </button>
                        {error && (
                            <p className="mt-3 text-sm font-medium text-red-600">
                                {error}
                            </p>
                        )}
                    </div>
                </div>
            </main>
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full text-center max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                        <h2 className="text-xl font-bold text-text-primary">
                            {isEditMode
                                ? "¡Categoría actualizada!"
                                : "¡Categoría creada!"}
                        </h2>

                        <p className="mt-2 text-sm text-gray-600">
                            {isEditMode
                                ? "La categoría se actualizó correctamente."
                                : "La categoría se creó correctamente."}
                        </p>

                        <button
                            type="button"
                            onClick={() => {
                                setShowSuccessModal(false);
                                navigate({
                                    to: "/categoryManagement",
                                });
                            }}
                            className="mt-6 w-full rounded-lg bg-mint-dark px-5 py-3 font-bold text-white transition hover:bg-mint-darker"
                        >
                            Continuar
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default CategoryForm;