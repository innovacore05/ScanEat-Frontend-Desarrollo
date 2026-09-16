const REVIEWS_BASE_URL = `${import.meta.env.VITE_API_URL}/api/reviews`;

type ApiError = {
  message?: string;
  error?: string;
};

export type ReviewableProduct = {
  productId: number;
  productName: string;
  reviewed: boolean;
};

export type ReviewableOrderResponse = {
  orderId: number;
  state: "delivered";
  products: ReviewableProduct[];
};

export type CreateReviewItem = {
  productId: number;
  rating: number;
  comment?: string;
};

export type CreateReviewsPayload = {
  tableId: string;
  reviews: CreateReviewItem[];
};

export type ProductReview = {
  rating: number;
  comment: string | null;
  createdAt: string;
};

export type ProductReviewsResponse = {
  productId: number;
  productName: string;
  averageRating: number;
  totalReviews: number;
  reviews: ProductReview[];
};

const parseError = async (response: Response) => {
  const data = (await response.json().catch(() => ({}))) as ApiError;

  return new Error(
    data.message ?? data.error ?? "Ocurrió un error con las reseñas.",
  );
};

export const getReviewableOrder = async (
  orderId: number,
  tableId: string,
): Promise<ReviewableOrderResponse> => {
  const url = new URL(`${REVIEWS_BASE_URL}/orders/${orderId}`);

  url.searchParams.set("tableId", tableId);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw await parseError(response);
  }

  return response.json() as Promise<ReviewableOrderResponse>;
};

export const createOrderReviews = async (
  orderId: number,
  payload: CreateReviewsPayload,
) => {
  const response = await fetch(`${REVIEWS_BASE_URL}/orders/${orderId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  return response.json().catch(() => ({}));
};

export const getProductReviews = async (
  productId: number,
): Promise<ProductReviewsResponse> => {
  const response = await fetch(`${REVIEWS_BASE_URL}/products/${productId}`);

  if (!response.ok) {
    throw await parseError(response);
  }

  return response.json() as Promise<ProductReviewsResponse>;
};