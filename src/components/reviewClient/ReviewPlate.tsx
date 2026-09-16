import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { HiArrowLeft, HiStar } from "react-icons/hi";
import {
    createOrderReviews,
    getReviewableOrder,
    type ReviewableProduct,
} from "../../services/reviewService";

type ReviewPlateProps = {
    orderId: number;
    tableId: string;
};

type ReviewValues = {
    rating: number;
    comment: string;
};

function ReviewPlate({ orderId, tableId }: ReviewPlateProps) {
    const navigate = useNavigate();

    const [products, setProducts] = useState<ReviewableProduct[]>([]);
    const [reviews, setReviews] = useState<Record<number, ReviewValues>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const loadReviewableOrder = async () => {
            try {
                setIsLoading(true);
                setError("");

                const data = await getReviewableOrder(orderId, tableId);

                setProducts(data.products);

                const initialReviews: Record<number, ReviewValues> = {};

                data.products.forEach((product) => {
                    initialReviews[product.productId] = {
                        rating: 0,
                        comment: "",
                    };
                });

                setReviews(initialReviews);
            } catch (loadError) {
                console.error("No se pudieron cargar los productos:", loadError);

                setError(
                    loadError instanceof Error
                        ? loadError.message
                        : "No se pudieron cargar los productos.",
                );
            } finally {
                setIsLoading(false);
            }
        };

        void loadReviewableOrder();
    }, [orderId, tableId]);

    const updateReview = (
        productId: number,
        changes: Partial<ReviewValues>,
    ) => {
        setReviews((current) => ({
            ...current,
            [productId]: {
                ...current[productId],
                ...changes,
            },
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const pendingProducts = products.filter((product) => !product.reviewed);

        const hasMissingRating = pendingProducts.some(
            (product) => !reviews[product.productId]?.rating,
        );

        if (hasMissingRating) {
            setError("Debes calificar todos los productos con estrellas.");
            return;
        }

        if (pendingProducts.length === 0) {
            setMessage("Este pedido ya tiene todas sus reseñas registradas.");
            return;
        }

        try {
            setIsSubmitting(true);
            setError("");
            setMessage("");

            await createOrderReviews(orderId, {
                tableId,
                reviews: pendingProducts.map((product) => {
                    const review = reviews[product.productId];

                    return {
                        productId: product.productId,
                        rating: review.rating,
                        ...(review.comment.trim()
                            ? { comment: review.comment.trim() }
                            : {}),
                    };
                }),
            });

            setProducts((current) =>
                current.map((product) =>
                    product.reviewed
                        ? product
                        : { ...product, reviewed: true },
                ),
            );

            setMessage("Las reseñas se guardaron correctamente.");

            window.setTimeout(() => {
                void navigate({
                    to: "/menuClient",
                    search: { orderId, tableId },
                });
            }, 1000);
        } catch (submitError) {
            console.error("No se pudieron guardar las reseñas:", submitError);

            setError(
                submitError instanceof Error
                    ? submitError.message
                    : "No se pudieron guardar las reseñas.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <main className="min-h-screen bg-[#f8f8f8] p-8">
                <p>Cargando productos del pedido...</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#f8f8f8] px-4 py-5 text-[#333] sm:px-6 sm:py-8 md:px-10 lg:px-16">
            <div className="mx-auto w-full max-w-5xl">
                <Link
                    to="/menuClient"
                    search={{ mesaId: tableId }}
                    className="flex w-fit items-center gap-2 text-lg font-bold text-mint-dark sm:text-xl"
                >
                    <HiArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span>Pedido</span>
                </Link>

                <h1 className="mt-6 text-2xl font-bold text-mint-darker sm:text-3xl">
                    Califica tu pedido
                </h1>

                <p className="mt-2 text-sm text-gray-600 sm:text-base">
                    Selecciona una calificación para cada producto.
                </p>

                {error && (
                    <p className="mt-5 rounded-md bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </p>
                )}

                {products.length === 0 && !error && (
                    <p className="mt-6 rounded-md border border-gray-200 bg-white p-4">
                        No hay productos para reseñar.
                    </p>
                )}

                <form onSubmit={handleSubmit}>
                    <section className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:gap-6 md:grid-cols-2">
                        {products.map((product) => {
                            const review = reviews[product.productId];
                            const isReviewed = product.reviewed;

                            return (
                                <article
                                    key={product.productId}
                                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <h2 className="text-base font-bold text-mint-darker sm:text-lg">
                                            {product.productName}
                                        </h2>

                                        {isReviewed && (
                                            <span className="shrink-0 text-xs font-semibold text-mint-dark">
                                                Ya reseñado
                                            </span>
                                        )}
                                    </div>

                                    {!isReviewed && (
                                        <>
                                            <div
                                                className="mt-3 flex gap-1"
                                                aria-label={`Calificación de ${product.productName}`}
                                            >
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() =>
                                                            updateReview(product.productId, {
                                                                rating: star,
                                                            })
                                                        }
                                                        aria-label={`${star} estrellas`}
                                                        className="rounded focus:outline-none focus:ring-2 focus:ring-mint-dark"
                                                    >
                                                        <HiStar
                                                            className={`h-7 w-7 sm:h-8 sm:w-8 ${star <= review.rating
                                                                    ? "fill-[#ffc477] text-[#ffc477]"
                                                                    : "fill-gray-200 text-[#ffc477]"
                                                                }`}
                                                        />
                                                    </button>
                                                ))}
                                            </div>

                                            <p className="mt-2 text-[10px] text-gray-500 sm:text-xs">
                                                El comentario es opcional.
                                            </p>

                                            <div className="mt-5 rounded-md border border-gray-200 p-3 sm:p-4">
                                                <label
                                                    htmlFor={`comment-${product.productId}`}
                                                    className="text-xs font-semibold sm:text-sm"
                                                >
                                                    Comentario
                                                </label>

                                                <textarea
                                                    id={`comment-${product.productId}`}
                                                    value={review.comment}
                                                    onChange={(event) =>
                                                        updateReview(product.productId, {
                                                            comment: event.target.value,
                                                        })
                                                    }
                                                    placeholder="Escribe un comentario opcional"
                                                    className="mt-2 min-h-24 w-full resize-none text-xs leading-relaxed outline-none placeholder:text-gray-500 sm:text-sm"
                                                />
                                            </div>
                                        </>
                                    )}
                                </article>
                            );
                        })}
                    </section>

                    {products.some((product) => !product.reviewed) && (
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="mt-6 w-full rounded-md bg-mint-dark px-5 py-3 text-xs font-semibold text-white transition hover:bg-mint-darker disabled:cursor-not-allowed disabled:opacity-50 sm:ml-auto sm:w-auto sm:px-8 sm:text-sm"
                        >
                            {isSubmitting ? "Guardando..." : "Enviar reseñas"}
                        </button>
                    )}

                    {message && (
                        <p className="mt-4 text-center text-sm text-mint-dark">
                            {message}
                        </p>
                    )}
                </form>
            </div>
        </main>
    );
}

export default ReviewPlate;