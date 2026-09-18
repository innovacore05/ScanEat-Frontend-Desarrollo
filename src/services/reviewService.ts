
import { cookieSessionClient } from "./cookieSessionClient";

const REVIEWS_BASE_URL = `${import.meta.env.VITE_API_URL}/api/reviews`;



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


export const getReviewableOrder = async (
  orderId: number,
  tableId: string,
): Promise<ReviewableOrderResponse> => {
  const url = new URL(`${REVIEWS_BASE_URL}/orders/${orderId}`);
  url.searchParams.set("tableId", tableId);

  // const response = await fetch(url.toString());

  // if (!response.ok) {
  //   throw await parseError(response);
  // }

  // return response.json() as Promise<ReviewableOrderResponse>;
  return cookieSessionClient.request<ReviewableOrderResponse>(
    url.toString(),{
    fallBackMessage:"No se pudo cargar la orden",
  });
};

export const createOrderReviews = async (
  orderId: number,
  payload: CreateReviewsPayload,
) => {
  // const response = await fetch(`${REVIEWS_BASE_URL}/orders/${orderId}`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(payload),
  // });

  // if (!response.ok) {
  //   throw await parseError(response);
  // }

  // return response.json().catch(() => ({}));
  return cookieSessionClient.request(`${REVIEWS_BASE_URL}/orders/${orderId}`,{
    method:"POST",
    body:JSON.stringify(payload),
   fallBackMessage:"No se pudo enviar la reseña",
  });
};

export const getProductReviews = async (
  productId: number,
): Promise<ProductReviewsResponse> => {
  // const response = await fetch(`${REVIEWS_BASE_URL}/products/${productId}`);

  // if (!response.ok) {
  //   throw await parseError(response);
  // }

  // return response.json() as Promise<ProductReviewsResponse>;
  return cookieSessionClient.request<ProductReviewsResponse>(
    `${REVIEWS_BASE_URL}/products/${productId}`,
   {fallBackMessage:
    "No se pudieron cargar las reseñas"
});
};