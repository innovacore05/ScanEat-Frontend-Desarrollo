import { Link } from "@tanstack/react-router";
import { useCart } from "../menuClient/CartContext";
import { HiArrowLeft } from "react-icons/hi";
import { FiMinus, FiPlus, FiX } from "react-icons/fi";
import { useState } from "react";

function CheckOrder() {
  const {
    cartItems,
    mesaId,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const iva = subtotal * 0.13;
  const total = subtotal + iva;

  return (
    <main className="min-h-screen bg-white">
      <div className="h-20 bg-mint" />

      <section className="-mt-10 min-h-[calc(100vh-5rem)] w-full rounded-t-[40px] bg-white px-6 py-10 lg:px-10">
        
        {/* Celular */}
        <div className="lg:hidden">
          <div className="flex items-center gap-2">
            <Link
              to="/menuClient"
              className="flex items-center gap-2 text-mint-dark"
            >
              <HiArrowLeft className="h-6 w-6" />

              <span className="text-[32px] font-bold">
                Revisar pedido
              </span>
            </Link>
          </div>

          <h3 className="mt-5 text-xl font-bold text-text-primary">
            Resumen del pedido
          </h3>
          <div className="mt-6 -mx-6 rounded-4xl bg-neutral-50 px-6 pb-8 pt-6">
            <div className="flex flex-col gap-4">
              {cartItems.length === 0 ? (
                <p className="text-text-primary">
                  No hay productos en el pedido.
                </p>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.productId}
                    className="flex min-h-32 overflow-hidden rounded-2xl bg-white shadow-sm"
                  >
                    <div className="w-32 shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full rounded-2xl object-cover"
                      />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3">
                      <h3 className="text-base font-bold text-mint-darker">
                        {item.name}
                      </h3>

                      <p className="text-base font-bold text-mint-darker">
                        ₡{item.price.toLocaleString("es-CR")}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            decreaseQuantity(item.productId)
                          }
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border bg-white"
                        >
                          <FiMinus className="h-4 w-4" />
                        </button>

                        <span className="w-6 text-center font-bold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            increaseQuantity(item.productId)
                          }
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-mint-dark text-white"
                        >
                          <FiPlus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeFromCart(item.productId)
                      }
                      className="mr-4 flex h-8 w-8 shrink-0 self-center cursor-pointer items-center justify-center rounded-full text-gray-500 hover:text-red-600"
                      aria-label={`Eliminar ${item.name}`}
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {cartItems.length > 0 && (
            <>
              <div className="mt-8 flex flex-col gap-2 border-t border-border pt-4">
                <div className="flex justify-between text-base">
                  <span>Subtotal</span>
                  <span>
                    ₡{subtotal.toLocaleString("es-CR")}
                  </span>
                </div>

                <div className="flex justify-between text-base">
                  <span>IVA (13%)</span>
                  <span>₡{iva.toLocaleString("es-CR")}</span>
                </div>

                <div className="mt-2 flex justify-between text-xl font-bold text-mint-darker">
                  <span>Total</span>
                  <span>
                    ₡{total.toLocaleString("es-CR")}
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <label
                  htmlFor="specialInstructionsMobile"
                  className="font-bold text-text-primary"
                >
                  Instrucciones especiales
                </label>

                <textarea
                  id="specialInstructionsMobile"
                  value={specialInstructions}
                  onChange={(event) =>
                    setSpecialInstructions(event.target.value)
                  }
                  placeholder="Ej. Hamburguesa sin tomate..."
                  className="mt-2 min-h-28 w-full resize-none rounded-2xl border border-border bg-white p-4 outline-none focus:border-mint-dark"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsConfirmDialogOpen(true)}
                className="mt-6 w-full cursor-pointer rounded-2xl bg-mint-dark py-4 text-lg font-bold text-white"
              >
                Realizar pedido
              </button>
            </>
          )}
        </div>

        {/* Computadora - Tablet */}
        <div className="hidden lg:block">
          <div className="flex items-center gap-2">
            <Link
              to="/menuClient"
              className="flex items-center gap-2 text-mint-dark"
            >
              <HiArrowLeft className="h-6 w-6" />

              <span className="text-2xl font-bold">
                Revisar pedido
              </span>
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-[minmax(0,1fr)_340px] gap-8 xl:grid-cols-[minmax(0,680px)_360px] xl:gap-10">

            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-text-primary">
                Platillos
              </h2>

              <div className="mt-6 rounded-4xl bg-neutral-50 px-6 py-6">
                {cartItems.length === 0 ? (
                  <p className="text-text-primary">
                    No hay productos en el pedido.
                  </p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.productId}
                        className="flex min-h-36 overflow-hidden rounded-2xl bg-white shadow-sm"
                      >
                        <div className="w-40 shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full rounded-2xl object-cover"
                          />
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col justify-center px-6 py-4">
                          <h3 className="text-lg font-bold text-mint-darker">
                            {item.name}
                          </h3>

                          <p className="mt-1 text-lg font-bold text-mint-darker">
                            ₡{item.price.toLocaleString("es-CR")}
                          </p>

                          <div className="mt-3 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                decreaseQuantity(item.productId)
                              }
                              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border bg-white"
                            >
                              <FiMinus className="h-4 w-4" />
                            </button>

                            <span className="w-8 text-center font-bold">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                increaseQuantity(item.productId)
                              }
                              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-mint-dark text-white"
                            >
                              <FiPlus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(item.productId)
                          }
                          className="mr-6 flex h-9 w-9 shrink-0 self-center cursor-pointer items-center justify-center rounded-full text-gray-500 hover:text-red-600"
                          aria-label={`Eliminar ${item.name}`}
                        >
                          <FiX className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-text-primary">
                Resumen del pedido
              </h2>

              {cartItems.length > 0 && (
                <>
                  <div className="mt-6 flex flex-col gap-2 border-t border-border pt-4">
                    <div className="flex justify-between text-base">
                      <span>Subtotal</span>
                      <span>
                        ₡{subtotal.toLocaleString("es-CR")}
                      </span>
                    </div>

                    <div className="flex justify-between text-base">
                      <span>IVA (13%)</span>
                      <span>
                        ₡{iva.toLocaleString("es-CR")}
                      </span>
                    </div>

                    <div className="mt-2 flex justify-between text-xl font-bold text-mint-darker">
                      <span>Total</span>
                      <span>
                        ₡{total.toLocaleString("es-CR")}
                      </span>
                    </div>
                  </div>

                  <div className="mt-8">
                    <label
                      htmlFor="specialInstructionsDesktop"
                      className="font-bold text-text-primary"
                    >
                      Instrucciones especiales
                    </label>

                    <textarea
                      id="specialInstructionsDesktop"
                      value={specialInstructions}
                      onChange={(event) =>
                        setSpecialInstructions(event.target.value)
                      }
                      placeholder="Ej. Hamburguesa sin tomate..."
                      className="mt-2 min-h-28 w-full resize-none rounded-2xl border border-border bg-white p-4 outline-none focus:border-mint-dark"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsConfirmDialogOpen(true)}
                    className="mt-6 w-full cursor-pointer rounded-2xl bg-mint-dark py-4 text-lg font-bold text-white"
                  >
                    Realizar pedido
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

          
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
              ¿Confirmar pedido?
            </h3>

            <p className="mt-2 text-sm text-text-primary">
              Una vez confirmado, será enviado para su
              preparación.
            </p>

            <p className="mt-2 text-sm text-red-500">
              Solo una persona por mesa puede confirmar el pedido.
            </p>

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
                onClick={() => {
                  setIsConfirmDialogOpen(false);

                  console.log({
                    mesaId,
                    cartItems,
                    specialInstructions,
                    subtotal,
                    iva,
                    total,
                  });
                }}
                className="cursor-pointer rounded-lg bg-mint-dark px-4 py-2 text-sm font-semibold text-white hover:bg-mint-darker"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default CheckOrder;