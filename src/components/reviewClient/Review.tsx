import { Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HiArrowLeft, HiStar } from "react-icons/hi";
import {
    getProductReviews,
    type ProductReviewsResponse,
} from "../../services/reviewService";

function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5" aria-label={`${rating} estrellas`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <HiStar
                    key={star}
                    className={`h-5 w-5 ${star <= Math.round(rating)
                            ? "fill-yellow text-yellow"
                            : "fill-gray-200 text-gray-300"
                        }`}
                />
            ))}
        </div>
    );
}

function Review() {
    const { productId, mesaId } = useSearch({
        from: "/(menuClient)/reviews",
    });

    const [data, setData] = useState<ProductReviewsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadReviews = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getProductReviews(productId);
                setData(response);
            } catch (loadError) {
                console.error("No se pudieron cargar las reseñas:", loadError);
                setError(
                    loadError instanceof Error
                        ? loadError.message
                        : "No se pudieron cargar las reseñas.",
                );
            } finally {
                setLoading(false);
            }
        };

        void loadReviews();
    }, [productId]);

    const ratingBars = [5, 4, 3, 2, 1].map((stars) => ({
        stars,
        total:
            data?.reviews.filter((review) => review.rating === stars).length ?? 0,
    }));

    return (
        <main className="min-h-screen bg-white px-4 py-6 text-text-primary sm:px-8 sm:py-8 md:px-12 lg:px-16">
            <div className="mx-auto flex w-full max-w-3xl flex-col">
                <Link
                    to="/menuClient"
                    search={{ mesaId }}
                    className="flex w-fit items-center gap-2 text-lg font-bold text-mint-dark sm:text-xl"
                >
                    <HiArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span>Reviews</span>
                </Link>

                {loading && <p className="mt-8">Cargando reseñas...</p>}

                {error && (
                    <p className="mt-8 rounded-md bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </p>
                )}

                {!loading && !error && data && (
                    <>
                        <header className="mt-5 border-b border-border pb-5">
                            <h1 className="text-2xl font-bold text-mint-darker">
                                {data.productName}
                            </h1>

                            <div className="mt-5 flex items-center gap-6">
                                <div>
                                    <p className="text-4xl font-bold text-mint-dark">
                                        {data.averageRating.toFixed(1)}
                                    </p>

                                    <Stars rating={data.averageRating} />

                                    <p className="mt-2 text-sm text-gray-500">
                                        {data.totalReviews} reseñas
                                    </p>
                                </div>

                                <div className="flex flex-col gap-1">
                                    {ratingBars.map((bar) => (
                                        <div
                                            key={bar.stars}
                                            className="flex items-center gap-2 text-xs"
                                        >
                                            <span className="w-3">{bar.stars}</span>

                                            <div className="h-1.5 w-32 rounded-full bg-neutral-200">
                                                <div
                                                    className="h-full rounded-full bg-mint-dark"
                                                    style={{
                                                        width: data.totalReviews
                                                            ? `${(bar.total / data.totalReviews) * 100}%`
                                                            : "0%",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </header>

                        <section className="mt-5 space-y-3">
                            {data.reviews.length === 0 && (
                                <p className="rounded-lg border border-border p-4">
                                    Este producto todavía no tiene reseñas.
                                </p>
                            )}

                            {data.reviews.map((review, index) => (
                                <article
                                    key={`${review.createdAt}-${index}`}
                                    className="rounded-lg border border-border p-4"
                                >
                                    <Stars rating={review.rating} />

                                    {review.comment?.trim() && (
                                        <p className="mt-3 text-sm leading-relaxed">
                                            {review.comment}
                                        </p>
                                    )}

                                    <p className="mt-3 text-xs text-gray-500">
                                        {new Date(review.createdAt).toLocaleDateString("es-CR", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                        })}
                                    </p>
                                </article>
                            ))}
                        </section>
                    </>
                )}
            </div>
        </main>
    );
}

export default Review;