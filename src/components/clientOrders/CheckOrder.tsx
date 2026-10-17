
import {
  Link,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useCart } from "./CartContext";
import { HiArrowLeft } from "react-icons/hi";
import { FiMinus, FiPlus, FiX } from "react-icons/fi";
import { useEffect, useState } from "react";
import {
  addItemsToOrder,
  getOrderQuote,
  type OrderQuote,
} from "../../services/orderService";
import { getPublicTableNumber } from "../../services/tableService";
import { submitSharedCart } from "../../services/sharedCartService";

function getDishName(
  name: string,
  selectedOptions?: Record<string, unknown>,
) {
  const values = Object.values(selectedOptions ?? {}).filter(
    (value): value is string =>
      typeof value === "string" && value.trim() !== "",
  );

  if (values.length === 0) return name;

  return `${name} (${values[0]})`;
}

function CheckOrder() {
  const {
    cartItems,
    mesaId,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    canModifyItem,

    orderAddItems,
    increaseOrderItemQuantity,
    decreaseOrderItemQuantity,
    removeOrderItem,
    clearOrderAddCart,
  } = useCart();

  const { orderId, mode, returnTo } = useSearch({
    from: "/(clientOrders)/checkOrder",
  });

  const isAddingToOrder = mode === "add" && orderId !== undefined;
  const displayedItems = isAddingToOrder ? orderAddItems : cartItems;
  const tableId = mesaId?.trim();

  const [tableInfo, setTableInfo] = useState<{
    tableId: string;
    tableNumber: number;
  } | null>(null);

  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);

  const [orderQuote, setOrderQuote] = useState<OrderQuote | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState("");

  const navigate = useNavigate();

  // Cotizar solamente los pedidos nuevos.
  useEffect(() => {
    if (isAddingToOrder || !tableId || cartItems.length === 0) {
      setOrderQuote(null);
      setIsQuoting(false);
      setQuoteError("");
      return;
    }

    let cancelled = false;

    const payload = {
      tableId,
      items: cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        selectedOptions: item.selectedOptions ?? {},
      })),
    };

    setOrderQuote(null);
    setIsQuoting(true);
    setQuoteError("");

    const timer = window.setTimeout(() => {
      void getOrderQuote(payload)
        .then((quote) => {
          if (!cancelled) setOrderQuote(quote);
        })
        .catch((error) => {
          console.error("Error cotizando el pedido:", error);

          if (!cancelled) {
            setQuoteError(
              "No se pudo actualizar el total. Intenta de nuevo.",
            );
          }
        })
        .finally(() => {
          if (!cancelled) setIsQuoting(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [tableId, cartItems, isAddingToOrder]);

  // Obtener el número público de la mesa.
  useEffect(() => {
    if (!tableId) {
      setTableInfo(null);
      return;
    }

    let isCurrentRequest = true;

    void getPublicTableNumber(tableId)
      .then(({ tableNumber }) => {
        if (isCurrentRequest) {
          setTableInfo({ tableId, tableNumber });
        }
      })
      .catch((error) => {
        console.error("Error loading table number:", error);

        if (isCurrentRequest) setTableInfo(null);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [tableId]);

  const handleCreateOrder = async () => {
    if (isSubmitting) return;

    if (isAddingToOrder) {
      if (!orderId || orderAddItems.length === 0) {
        alert("Agrega al menos un producto a la orden.");
        return;
      }
    } else {
      if (isQuoting || quoteError || !orderQuote) return;

      if (cartItems.length === 0) {
        alert("Agrega al menos un producto al pedido.");
        return;
      }
    }

    if (!tableId) {
      alert("No se encontró una mesa válida para este pedido.");
      return;
    }

    setIsSubmitting(true);

    const items = displayedItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      selectedOptions: item.selectedOptions ?? {},
    }));

    try {
      let resultingOrderId: number;

      if (isAddingToOrder) {
        // Añadir únicamente los productos del carrito temporal
        // a la comanda que ya existe.
        await addItemsToOrder(orderId!, { items });

        resultingOrderId = orderId!;

        // Limpiar el carrito temporal solamente si el envío funcionó.
        clearOrderAddCart();
      } else {
        // Enviar el carrito compartido para crear un pedido nuevo.
        const createdOrder = await submitSharedCart(
          tableId,
          specialInstructions.trim() || undefined,
        );

        resultingOrderId = createdOrder.order.orderId;

        localStorage.setItem(
          "currentOrderId",
          String(resultingOrderId),
        );
        localStorage.setItem("currentOrderTableId", tableId);

        clearCart();
      }

      setSpecialInstructions("");
      setIsConfirmDialogOpen(false);
      setCreatedOrderId(resultingOrderId);
      setIsSuccessDialogOpen(true);
    } catch (error) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : "No se pudo enviar el pedido.";

      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = isAddingToOrder
    ? orderAddItems.length > 0 &&
      Boolean(orderId) &&
      !isSubmitting
    : cartItems.length > 0 &&
      !isQuoting &&
      !quoteError &&
      Boolean(orderQuote) &&
      !isSubmitting;

  const handleSuccess = () => {
    if (createdOrderId === null) return;

    setIsSuccessDialogOpen(false);

    if (!isAddingToOrder) {
      void navigate({
        to: "/orderStatus",
        search: {
          orderId: createdOrderId,
          tableId,
        },
      });
      return;
    }

    if (returnTo === "cashier") {
      void navigate({
        to: "/paymentMethod",
        search: {
          orderId: createdOrderId,
        },
      });
      return;
    }

    void navigate({ to: "/waiterOrders" });
  };

  // Resumen de precios para pedidos nuevos.
  const renderOrderTotals = () => {
    if (isAddingToOrder) {
      return (
        <p className="text-sm text-text-primary">
          El total actualizado de la comanda se calculará al agregar
          estos productos.
        </p>
      );
    }

    if (isQuoting) return <p>Actualizando el total…</p>;

    if (quoteError) {
      return (
        <p role="alert" className="text-red-600">
          {quoteError}
        </p>
      );
    }

    if (!orderQuote) return null;

    const subtotal = Number(orderQuote.totals.subtotal);
    const subtotalBeforeDiscount = Number(
      orderQuote.totals.subtotalBeforeDiscount,
    );
    const discount = Number(orderQuote.totals.discount);
    const tax = Number(orderQuote.totals.tax);
    const total = Number(orderQuote.totals.total);
    const hasDiscount = discount > 0;

    return (
      <>
        {hasDiscount ? (
          <>
            <div className="flex justify-between gap-4 text-base">
              <span>Subtotal</span>
              <span className="text-gray-500 line-through">
                ₡{subtotalBeforeDiscount.toLocaleString("es-CR")}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-base">
              <span>Descuento</span>
              <span>₡{discount.toLocaleString("es-CR")}</span>
            </div>

            <div className="flex justify-between gap-4 text-base font-medium">
              <span>Subtotal con descuento aplicado</span>
              <span>₡{subtotal.toLocaleString("es-CR")}</span>
            </div>
          </>
        ) : (
          <div className="flex justify-between gap-4 text-base">
            <span>Subtotal</span>
            <span>₡{subtotal.toLocaleString("es-CR")}</span>
          </div>
        )}

        <div className="flex justify-between gap-4 text-base">
          <span>IVA</span>
          <span>₡{tax.toLocaleString("es-CR")}</span>
        </div>

        <div className="mt-2 flex justify-between gap-4 text-xl font-bold text-mint-darker">
          <span>Total</span>
          <span>₡{total.toLocaleString("es-CR")}</span>
        </div>
      </>
    );
  };

  // Modificar cantidades según el carrito activo.
  const renderItemQuantity = (
    item: (typeof displayedItems)[number],
    isMobile: boolean,
  ) => {
    const editable = isAddingToOrder || canModifyItem(item);

    if (!editable) {
      return (
        <span className="mt-2 text-sm text-text-primary">
          Cantidad: {item.quantity}
        </span>
      );
    }

    const decrease = () => {
      if (isAddingToOrder) {
        decreaseOrderItemQuantity(item.cartItemId);
      } else {
        decreaseQuantity(item.cartItemId);
      }
    };

    const increase = () => {
      if (isAddingToOrder) {
        increaseOrderItemQuantity(item.cartItemId);
      } else {
        increaseQuantity(item.cartItemId);
      }
    };

    return (
      <div
        className={`flex items-center gap-2 ${
          isMobile ? "mt-2" : "mt-3"
        }`}
      >
        <button
          type="button"
          onClick={decrease}
          className={`flex ${
            isMobile ? "h-8 w-8" : "h-9 w-9"
          } cursor-pointer items-center justify-center rounded-full border border-border bg-white`}
          aria-label={`Disminuir cantidad de ${item.name}`}
        >
          <FiMinus className="h-4 w-4" />
        </button>

        <span
          className={`${
            isMobile ? "w-6" : "w-8"
          } text-center font-bold`}
        >
          {item.quantity}
        </span>

        <button
          type="button"
          onClick={increase}
          className={`flex ${
            isMobile ? "h-8 w-8" : "h-9 w-9"
          } cursor-pointer items-center justify-center rounded-full bg-mint-dark text-white`}
          aria-label={`Aumentar cantidad de ${item.name}`}
        >
          <FiPlus className="h-4 w-4" />
        </button>
      </div>
    );
  };

  // Eliminar del carrito activo.
  const renderRemoveButton = (
    item: (typeof displayedItems)[number],
    isMobile: boolean,
  ) => {
    if (!isAddingToOrder && !canModifyItem(item)) return null;

    const remove = () => {
      if (isAddingToOrder) {
        removeOrderItem(item.cartItemId);
      } else {
        removeFromCart(item.cartItemId);
      }
    };

    return (
      <button
        type="button"
        onClick={remove}
        className={`${
          isMobile ? "mr-4 h-8 w-8" : "mr-6 h-9 w-9"
        } flex shrink-0 cursor-pointer items-center justify-center self-center rounded-full text-gray-500 hover:text-red-600`}
        aria-label={`Eliminar ${item.name}`}
      >
        <FiX className="h-5 w-5" />
      </button>
    );
  };

  // Tarjeta reutilizable para los productos del carrito activo
  const renderCartItems = (isMobile: boolean) => {
    if (displayedItems.length === 0) {
      return (
        <p className="text-text-primary">
          No hay productos en el pedido.
        </p>
      );
    }

    return displayedItems.map((item) => (
      <div
        key={item.cartItemId}
        className={`flex ${
          isMobile ? "min-h-32" : "min-h-36"
        } overflow-hidden rounded-2xl bg-white shadow-sm`}
      >
        <div
          className={`shrink-0 ${
            isMobile ? "h-34 w-32" : "h-40 w-40"
          }`}
        >
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full rounded-2xl object-cover"
          />
        </div>

        <div
          className={`flex min-w-0 flex-1 flex-col justify-center ${
            isMobile ? "px-4 py-3" : "px-6 py-4"
          }`}
        >
          <h3
            className={`line-clamp-2 font-bold text-mint-darker ${
              isMobile ? "text-base" : "text-lg"
            }`}
          >
            {getDishName(item.name, item.selectedOptions)}
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            {Number(item.discount ?? 0) > 0 ? (
              <>
                <span className="relative text-sm font-bold text-mint-darker">
                  ₡{item.price.toLocaleString("es-CR")}
                  <span className="absolute left-0 top-1/2 h-0.5 w-full -rotate-12 bg-red-600" />
                </span>

                <span className="text-base font-bold text-mint-darker">
                  ₡{(
                    item.price *
                    (1 - Number(item.discount) / 100)
                  ).toLocaleString("es-CR")}
                </span>
              </>
            ) : (
              <span className="text-base font-bold text-mint-darker">
                ₡{item.price.toLocaleString("es-CR")}
              </span>
            )}
          </div>

          {renderItemQuantity(item, isMobile)}
        </div>

        {renderRemoveButton(item, isMobile)}
      </div>
    ));
  };

  const renderInstructions = (id: string) => (
    <div className="mt-8">
      <label htmlFor={id} className="font-bold text-text-primary">
        Instrucciones especiales
      </label>

      <textarea
        id={id}
        value={specialInstructions}
        onChange={(event) => setSpecialInstructions(event.target.value)}
        placeholder="Ej. Hamburguesa sin tomate..."
        disabled={isAddingToOrder}
        className="mt-2 min-h-28 w-full resize-none rounded-2xl border border-border bg-white p-4 outline-none focus:border-mint-dark disabled:bg-gray-100"
      />
    </div>
  );

  const renderSubmitButton = () => (
    <button
      type="button"
      onClick={() => setIsConfirmDialogOpen(true)}
      disabled={!canSubmit}
      className="mt-6 w-full cursor-pointer rounded-2xl bg-mint-dark py-4 text-lg font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isAddingToOrder ? "Agregar productos a la orden" : "Realizar pedido"}
    </button>
  );

  return (
    <main className="min-h-screen bg-white">
      <div className="h-20 bg-mint-dark" />

      <section className="-mt-10 min-h-[calc(100vh-5rem)] w-full rounded-t-[40px] bg-white px-6 py-10 lg:px-10">
        {/* Celular */}
        <div className="lg:hidden">
          <div className="flex items-center gap-2">
            <Link
              to="/menuClient"
              search={{ mesaId: tableId, orderId, mode, returnTo }}
              className="flex items-center gap-2 text-mint-dark"
            >
              <HiArrowLeft className="h-6 w-6" />
              <span className="text-[32px] font-bold">
                Revisar pedido
              </span>
            </Link>
          </div>

          {tableInfo && tableInfo.tableId === tableId && (
  <p className="mt-3 font-bold text-mint-dark">
    Mesa #{tableInfo.tableNumber}
  </p>
)}

          <h3 className="mt-5 text-xl font-bold text-text-primary">
            Resumen del pedido
          </h3>

          <div className="-mx-6 mt-6 rounded-4xl bg-neutral-50 px-6 pb-8 pt-6">
            <div className="flex flex-col gap-4">
              {renderCartItems(true)}
            </div>
          </div>

          {displayedItems.length > 0 && (
            <>
              <div className="mt-8 flex flex-col gap-2 border-t border-border pt-4">
                {renderOrderTotals()}
              </div>

              {renderInstructions("specialInstructionsMobile")}
              {renderSubmitButton()}
            </>
          )}
        </div>

        {/* Computadora y tablet */}
        <div className="hidden lg:block">
          <div className="flex items-center gap-2">
            <Link
              to="/menuClient"
              search={{ mesaId: tableId, orderId, mode, returnTo }}
              className="flex items-center gap-2 text-mint-dark"
            >
              <HiArrowLeft className="h-6 w-6" />
              <span className="text-3xl font-bold">
                Revisar pedido
              </span>
            </Link>
          </div>

          {tableInfo && tableInfo.tableId === tableId && (
  <p className="mt-3 font-bold text-mint-dark">
    Mesa #{tableInfo.tableNumber}
  </p>
)}

          <div className="mt-8 grid grid-cols-[minmax(0,1fr)_340px] gap-8 xl:grid-cols-[minmax(0,680px)_360px] xl:gap-10">
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-text-primary">
                Platillos
              </h2>

              <div className="mt-6 rounded-4xl bg-neutral-50 px-6 py-6">
                <div className="flex flex-col gap-4">
                  {renderCartItems(false)}
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-text-primary">
                Resumen del pedido
              </h2>

              {displayedItems.length > 0 && (
                <>
                  <div className="mt-6 flex flex-col gap-2 border-t border-border pt-4">
                    {renderOrderTotals()}
                  </div>

                  {renderInstructions("specialInstructionsDesktop")}
                  {renderSubmitButton()}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Modal de éxito */}
      {isSuccessDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-dialog-title"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <h2
              id="success-dialog-title"
              className="text-lg font-bold text-mint-darker"
            >
              ¡Listo!
            </h2>

            <p className="mt-2 text-sm text-text-primary">
              {isAddingToOrder
                ? "Los productos se agregaron correctamente a la orden."
                : "Tu pedido fue enviado correctamente."}
            </p>

            <button
              type="button"
              onClick={handleSuccess}
              className="mt-6 cursor-pointer rounded-lg bg-mint-dark px-5 py-2 text-sm font-semibold text-white"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      {isConfirmDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3
              id="confirm-dialog-title"
              className="text-lg font-bold text-mint-darker"
            >
              {isAddingToOrder
                ? "¿Agregar productos a la orden?"
                : "¿Confirmar pedido?"}
            </h3>

            <p className="mt-2 text-sm text-text-primary">
              {isAddingToOrder
                ? "Los productos se agregarán a la orden existente."
                : "Una vez confirmado, será enviado para su preparación."}
            </p>

            {!isAddingToOrder && (
              <p className="mt-2 text-sm text-red-500">
                Solo una persona por mesa puede confirmar el pedido.
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmDialogOpen(false)}
                className="cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-text-primary hover:bg-gray-100"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={!canSubmit}
                onClick={() => void handleCreateOrder()}
                className="cursor-pointer rounded-lg bg-mint-dark px-4 py-2 text-sm font-semibold text-white hover:bg-mint-darker disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Enviando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default CheckOrder;
