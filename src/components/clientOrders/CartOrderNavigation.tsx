import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

export default function CartOrderNavigation() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleOrderSubmitted = (event: Event) => {
      const { tableId, orderId } = (
        event as CustomEvent<{
          tableId: string;
          orderId: number;
        }>
      ).detail;

      void navigate({
        to: "/orderStatus",
        search: {
          orderId,
          tableId,
        },
      });
    };

    window.addEventListener(
      "scaneat:order-submitted",
      handleOrderSubmitted,
    );

    return () => {
      window.removeEventListener(
        "scaneat:order-submitted",
        handleOrderSubmitted,
      );
    };
  }, [navigate]);

  return null;
}