import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HiArrowLeft } from "react-icons/hi";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getCategories, deleteCategory, type Category, } from "../../services/productService";
import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import {
    LuCakeSlice,
    LuSandwich,
    LuCroissant,
    LuUtensils,
    LuIceCreamBowl,
    LuSalad,
    LuBadgePercent,
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

const CATEGORY_ICONS = {
    "dessert": LuCakeSlice,
    "drinks": RiDrinks2Line,
    "coffee": GiCoffeeCup,
    "sandwich": LuSandwich,
    "breakfast": LuCroissant,
    "lunch": LuUtensils,
    "dinner": GiKnifeFork,
    "ice_cream": LuIceCreamBowl,
    "pizza": GiPizzaSlice,
    "burger": GiHamburger,
    "hotdog": GiHotDog,
    "tacos": GiTacos,
    "chicken": GiChickenLeg,
    "steak": GiSteak,
    "salad": LuSalad,
    "donut": GiDonut,
    "chocolate": GiChocolateBar,
    "promotion": LuBadgePercent,
};

function CategoryManagement() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [deleteError, setDeleteError] = useState("");

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (error) {
                console.error("Error loading categories:", error);
            } finally {
                setLoading(false);
            }
        };

        loadCategories();
    }, []);



    return (
        <DashboardLayout>

            {categoryToDelete && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-category-dialog-title"
                >
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                        <h3
                            id="delete-category-dialog-title"
                            className="text-lg font-bold text-mint-darker"
                        >
                            ¿Eliminar categoría?
                        </h3>

                        <p className="mt-2 text-sm text-text-primary">
                            ¿Deseas eliminar &ldquo;{categoryToDelete.name}&rdquo;?
                            Esta acción no se puede deshacer.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setCategoryToDelete(null)}
                                disabled={deletingId !== null}
                                className="cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-text-primary hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        setDeletingId(categoryToDelete.categoryId);

                                        await deleteCategory(categoryToDelete.categoryId);

                                        setCategories((currentCategories) =>
                                            currentCategories.filter(
                                                (category) =>
                                                    category.categoryId !== categoryToDelete.categoryId
                                            )
                                        );

                                        setCategoryToDelete(null);
                                    } catch (error) {
                                        console.error("Error deleting category:", error);

                                        const apiError = error as { message?: string };

                                        setDeleteError(
                                            apiError.message ??
                                            "No se pudo eliminar la categoría."
                                        );

                                        setCategoryToDelete(null);
                                    } finally {
                                        setDeletingId(null);
                                    }
                                }}
                                disabled={deletingId !== null}
                                className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {deletingId !== null ? "Eliminando..." : "Eliminar"}
                            </button>

                        </div>
                    </div>
                </div>
            )}
            {deleteError && (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-error-dialog-title"
    >
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3
                id="delete-error-dialog-title"
                className="text-lg font-bold text-mint-darker"
            >
                No se puede eliminar la categoría
            </h3>

            <p className="mt-2 text-sm text-text-primary">
                {deleteError}
            </p>

            <div className="mt-6 flex justify-end">
                <button
                    type="button"
                    onClick={() => setDeleteError("")}
                    className="cursor-pointer rounded-lg bg-mint-dark px-4 py-2 text-sm font-semibold text-white hover:bg-mint-darker"
                >
                    Entendido
                </button>
            </div>
        </div>
    </div>
)}
            <main className="min-h-screen bg-white px-8 py-8 lg:px-15 lg:py-15">
                <div className="flex items-center gap-2">
                    <Link
                        to="/menuManagment"
                        className="flex items-center gap-2 text-mint-dark"
                    >
                        <HiArrowLeft className="h-6 w-6" />

                        <span className="text-[32px] font-bold">
                            Gestionar categorías
                        </span>
                    </Link>
                </div>

                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-text-primary">
                        Categorías
                    </h2>
                    <Link
                        to="/categoryForm"
                        className="mt-6 flex w-fit items-center justify-between gap-8 rounded-lg  bg-mint-dark px-6 py-3 text-base font-bold hover:bg-mint-darker"
                    >
                        <span className="text-base font-bold text-white">
                            Agregar categoría
                        </span>
                    </Link>

                    {loading ? (
                        <p className="mt-4 text-text-primary">
                            Cargando categorías...
                        </p>
                    ) : categories.length === 0 ? (
                        <p className="mt-4 text-text-primary">
                            No hay categorías creadas.
                        </p>
                    ) : (
                        <div className="mt-6 flex flex-col gap-3">
                            {categories.map((category) => {
                                const Icon =
                                    CATEGORY_ICONS[category.icon as keyof typeof CATEGORY_ICONS] ??
                                    LuUtensils;

                                return (
                                    <div
                                        key={category.categoryId}
                                        className="flex items-center justify-between rounded-lg border border-border px-5 py-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint-dark text-white">
                                                <Icon className="h-7 w-7" />
                                            </div>

                                            <span className="font-bold text-text-primary">
                                                {category.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link
                                                to="/categoryForm"
                                                search={{
                                                    mode: "edit",
                                                    categoryId: category.categoryId,
                                                }}
                                                className="flex h-10 w-10 items-center justify-center rounded-lg text-mint-dark cursor-pointer hover:text-mint-darker"
                                                aria-label={`Editar categoría ${category.name}`}
                                            >
                                                <MdOutlineEdit className="h-6 w-6" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => setCategoryToDelete(category)}
                                                disabled={deletingId === category.categoryId}
                                                className="flex h-10 w-10 items-center justify-center rounded-lg text-red-500 hover:text-red-700 cursor-pointer"
                                                aria-label={`Eliminar categoría ${category.name}`}
                                            >
                                                <MdDeleteOutline className="h-6 w-6" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </DashboardLayout>
    );
}

export default CategoryManagement;