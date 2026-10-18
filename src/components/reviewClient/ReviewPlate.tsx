import { Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { HiArrowLeft, HiStar } from "react-icons/hi";
import ReviewSuccess from "./reviewSuccess";
import {
  createOrderReviews,
  getReviewableOrder,
  type ReviewableProduct,
} from "../../services/reviewService";
import Skeleton from "../shared/Skeleton";

type ReviewPlateProps = {
  orderId: number;
  tableId: string;
};

type ReviewValues = {
  rating: number;
  name: string;
  comment: string;
};

function ReviewPlate({ orderId, tableId }: ReviewPlateProps) {


  const [products, setProducts] = useState<ReviewableProduct[]>([]);
  const [reviews, setReviews] = useState<Record<number, ReviewValues>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  

  useEffect(() => {
    const loadReviewableOrder = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getReviewableOrder(orderId, tableId);

        setProducts(data.products);

        const initialReviews: Record<number, ReviewValues> = {};

        data.products.forEach((product) => {
          initialReviews[product.detailId] = {
            rating: 0,
            name: "",
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

  const updateReview = (detailId: number, changes: Partial<ReviewValues>) => {
    setReviews((current) => ({
      ...current,
      [detailId]: {
        ...current[detailId],
        ...changes,
      },
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const pendingProducts = products.filter((product) => !product.reviewed);
    const selectedProducts = pendingProducts.filter(
      (product) => reviews[product.detailId]?.rating > 0,
    );

    if (pendingProducts.length === 0) {
      setMessage("Este pedido ya tiene todas sus reseñas registradas.");
      return;
    }

    if (selectedProducts.length === 0) {
      setError("Selecciona estrellas en al menos un producto para enviar la reseña.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setMessage("");

      await createOrderReviews(orderId, {
        tableId,
        reviews: selectedProducts.map((product) => {
          const review = reviews[product.detailId];
          
          return {
            detailId: product.detailId,
            rating: review.rating,
            ...(review.name.trim() ? { name: review.name.trim() } : {}),
            ...(review.comment.trim()
              ? { comment: review.comment.trim() }
              : {}),
          };
        }),
      });

      setProducts((current) =>
        current.map((product) =>
          selectedProducts.some((selected) => selected.detailId === product.detailId)
            ? { ...product, reviewed: true }
            : product,
        ),
      );

     
      setIsSuccess(true);

            } catch (submitError) {
      console.error("No se pudieron guardar las reseñas:", submitError);

      const message =
        submitError &&
        typeof submitError === "object" &&
        "message" in submitError &&
        typeof submitError.message === "string"
          ? submitError.message
          : "No se pudieron guardar las reseñas.";

      const rejectedReviews =
        submitError &&
        typeof submitError === "object" &&
        "rejectedReviews" in submitError &&
        Array.isArray(submitError.rejectedReviews)
          ? submitError.rejectedReviews
          : [];

      const rejectionText = rejectedReviews
        .map((item) => {
          if (
            item &&
            typeof item === "object" &&
            "detailId" in item &&
            "reason" in item &&
            typeof item.detailId === "number" &&
            typeof item.reason === "string"
          ) {
            const fields: Array<"name" | "comment"> =
              "fields" in item && Array.isArray(item.fields)
                ? item.fields.filter(
                    (field: unknown): field is "name" | "comment" =>
                      field === "name" || field === "comment",
                  )
                : [];
            const labels = fields
              .map((field) => (field === "name" ? "nombre" : "comentario"))
              .join(" y ");
            const fieldLabel = labels || "reseña";
            return `Revisa el ${fieldLabel} de la reseña. La razón: ${item.reason}`;
          }

          return null;
        })
        .filter((value): value is string => value !== null)
        .join(" ");

      setError(
        rejectionText ? `${message} ${rejectionText}` : message,
      );
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f8f8f8] px-4 py-5 sm:px-6 sm:py-8 md:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-5xl">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="mt-6 h-9 w-56" />
          <Skeleton className="mt-2 h-4 w-72 max-w-full" />

          <section className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <article
                key={index}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <Skeleton className="h-6 w-44" />
                <Skeleton className="mt-4 h-8 w-36" />
                <Skeleton className="mt-3 h-3 w-64 max-w-full" />
                <div className="mt-5 rounded-md border border-gray-200 p-3 sm:p-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="mt-3 h-16 w-full" />
                </div>
                <div className="mt-5 rounded-md border border-gray-200 p-3 sm:p-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-3 h-24 w-full" />
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>
    );
  };



if (isSuccess) {
  return (
    <ReviewSuccess
     
    />
  );
};



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
              const review = reviews[product.detailId];
              const isReviewed = product.reviewed;

              return (
                <article
                  key={product.detailId}
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
                        aria-label={`Calificación de ${product.productName}, producto del pedido`}
                      >
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() =>
                              updateReview(product.detailId, {
                                rating: star,
                              })
                            }
                            aria-label={`${star} estrellas`}
                            className="rounded focus:outline-none focus:ring-2 focus:ring-mint-dark"
                          >
                            <HiStar
                              className={`h-7 w-7 sm:h-8 sm:w-8 ${
                                star <= review.rating
                                  ? "fill-[#ffc477] text-[#ffc477]"
                                  : "fill-gray-200 text-[#ffc477]"
                              }`}
                            />
                          </button>
                        ))}
                      </div>

                      <p className="mt-2 text-[10px] text-gray-500 sm:text-xs">
                        El nombre y el comentario son opcionales.
                      </p>

                      <div className="mt-5 rounded-md border border-gray-200 p-2 sm:p-4">
                        <label
                          htmlFor={`name-${product.detailId}`}
                          className="text-xs font-semibold sm:text-sm"
                        >
                          Nombre
                        </label>

                        <textarea
                          id={`name-${product.detailId}`}
                          value={review.name}
                          maxLength={80}
                          onChange={(event) =>
                            updateReview(product.detailId, {
                              name: event.target.value,
                            })
                          }
                          placeholder="Escribe tu nombre"
                          className="mt-2 min-h-16 w-full resize-none text-xs leading-relaxed outline-none placeholder:text-gray-500 sm:text-sm"
                        />
                      </div>

                      <div className="mt-5 rounded-md border border-gray-200 p-3 sm:p-4">
                        <label
                          htmlFor={`comment-${product.detailId}`}
                          className="text-xs font-semibold sm:text-sm"
                        >
                          Comentario
                        </label>

                        <textarea
                          id={`comment-${product.detailId}`}
                          value={review.comment}
                          onChange={(event) =>
                            updateReview(product.detailId, {
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
            <p className="mt-4 text-center text-sm text-mint-dark">{message}</p>
          )}
        </form>
      </div>
    </main>
  );
}

export default ReviewPlate;
