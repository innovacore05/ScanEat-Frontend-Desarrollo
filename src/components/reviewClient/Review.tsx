import { Link, useSearch } from "@tanstack/react-router";
import { HiArrowLeft, HiStar } from "react-icons/hi";

const reviews = [
    {
        id: 1,
        title: "Pedido",
        text: "Comentario sobre el alimento consumido dentro de las instalaciones",
        rating: 4,
    },
    {
        id: 2,
        title: "Pedido",
        text: "Comentario sobre el alimento consumido dentro de las instalaciones",
        rating: 4,
    },
];

const ratingBars = [
    { stars: 5, total: 1 },
    { stars: 4, total: 4 },
    { stars: 3, total: 1 },
    { stars: 2, total: 0.5 },
    { stars: 1, total: 0 },
];

const maxRatingTotal = 4;

function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5" aria-label={`${rating} estrellas`}>
            {Array.from({ length: rating }, (_, index) => (
                <HiStar
                    key={index}
                    className="h-4 w-4 fill-yellow text-yellow sm:h-5 sm:w-5"
                />
            ))}
        </div>
    );
}

function Review() {
    const { mesaId } = useSearch({
        from: "/(menuClient)/reviews",
    });

    return (
        <main className="min-h-screen bg-white px-4 py-6 text-text-primary sm:px-8 sm:py-8 md:px-12 lg:px-16">
            <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-3xl flex-col sm:min-h-[calc(100vh-4rem)]">
                <Link
                    to="/menuClient"
                    search={{ mesaId }}
                    className="flex w-fit items-center gap-2 text-lg font-bold text-mint-dark sm:text-xl"
                >
                    <HiArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span>Reviews</span>
                </Link>

                <section className="mt-5 flex items-stretch gap-5 border-b border-border pb-5 sm:gap-8">
                    <div className="flex min-w-28 flex-col justify-center">
                        <p className="text-4xl font-bold text-mint-dark sm:text-5xl">
                            4.0
                        </p>

                        <div className="mt-1">
                            <Stars rating={4} />
                        </div>
                    </div>

                    <div className="border-l border-border pl-5 sm:pl-8">
                        <div className="flex h-full flex-col justify-center gap-1">
                            {ratingBars.map((bar) => (
                                <div
                                    key={bar.stars}
                                    className="flex items-center gap-2 text-xs"
                                >
                                    <span className="w-3">{bar.stars}</span>

                                    <div className="h-1.5 w-32 rounded-full bg-neutral-200 sm:w-44 md:w-56">
                                        <div
                                            className="h-full rounded-full bg-mint-dark"
                                            style={{
                                                width: `${(bar.total / maxRatingTotal) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                <section className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {reviews.map((review) => (
                        <article
                            key={review.id}
                            className="rounded-lg border border-border p-4"
                        >
                            <p className="text-sm font-bold sm:text-base">
                                {review.title}
                            </p>

                            <p className="mt-2 text-xs leading-relaxed sm:text-sm">
                                {review.text}
                            </p>

                            <div className="mt-3">
                                <Stars rating={review.rating} />
                            </div>
                        </article>
                    ))}
                </section>
            </div>
        </main>
    );
}

export default Review;