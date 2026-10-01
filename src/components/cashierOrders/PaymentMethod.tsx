import { useEffect, useState } from "react";
import { Link, useSearch } from "@tanstack/react-router";

import { RestaurantLogo } from "../theme/RestaurantLogo";

import { HiArrowLeft } from "react-icons/hi";
import { BsFillPlusCircleFill } from "react-icons/bs";
import {
  getPaymentPreview,
  payOrder,
  type PaymentPreview,
} from "../../services/billingService";

function PaymentMethod() {
  const search = useSearch({ strict: false });
  const orderId = Number(search.orderId);

  const [order, setOrder] = useState<PaymentPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = await getPaymentPreview(orderId);
        setOrder(data);
      } catch (error) {
        console.error("Error cargando la orden", error);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  if (loading) {
    return <p>Cargando recibo...</p>;
  }

  if (!order) {
    return <p>No se pudo cargar la orden.</p>;
  }
  return (
    <main className="min-h-screen bg-white">
      <div className="h-22 bg-mint px-8 py-4">
        <RestaurantLogo className="h-16 w-16" />
      </div>

      <section className="px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-300">
          <div className="flex items-center gap-4">
            <Link
              to="/cashierOrders"
              className="cursor-pointer text-mint"
              aria-label="Volver a pedidos"
            >
              <HiArrowLeft className="h-8 w-8 text-mint-dark" />
            </Link>

            <h1 className="text-3xl font-bold text-mint-dark lg:text-4xl">
              Selecciona el método de pago
            </h1>
          </div>

          <p className="mt-6 w-74 rounded-xl border border-border p-3 text-xl text-gray-600 lg:text-2xl">
            Cuenta de mesa #{order.tableNumber}
          </p>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-xl border border-border p-6 lg:p-8">
              <h2 className="text-center text-2xl font-bold text-mint-dark lg:text-3xl">
                Recibo
              </h2>

              

              <h3 className="mt-7 text-lg font-bold text-mint-dark lg:text-xl">
                Total de pedido
              </h3>

              <div className="mt-5 max-h-60 overflow-y-auto pr-6">
                <div className="flex flex-col gap-4">
                  {order.lines.map((line) => (
                    <div
                      key={line.detailId}
                      className="flex items-center justify-between gap-4"
                    >
                      <p>
                        {line.detail} x {line.quantity}
                      </p>
                      {/* iva */}
                      <p className="tracking-wider">{line.total}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <p>IVA (13%)</p>
                 <p className="tracking-wider">{order.totals.totalTax}</p>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xl font-bold">Total</p>
                  {/* total */}
                  <p className="text-xl font-bold tracking-wider text-mint-dark">
                    {order.totals.totalSale}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button type="button" className="cursor-pointer">
                  <BsFillPlusCircleFill className="h-9 w-9 text-mint-dark" />
                </button>
              </div>
            </div>

            <div className="flex flex-col justify-center px-2 lg:px-8">
              <div className="flex flex-col items-center gap-5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("sinpe")}
                  className={`w-full max-w-72 cursor-pointer rounded-xl border border-border py-3 text-xl transition ${
                    paymentMethod === "sinpe"
                      ? "bg-mint text-white"
                      : "text-gray-700"
                  }`}
                >
                  SINPE Móvil
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("tarjeta")}
                  className={`w-full max-w-72 cursor-pointer rounded-xl border border-border py-3 text-xl transition ${
                    paymentMethod === "tarjeta"
                      ? "bg-mint text-white"
                      : "text-gray-700"
                  }`}
                >
                  Tarjeta
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("efectivo")}
                  className={`w-full max-w-72 cursor-pointer rounded-xl border border-border py-3 text-xl transition ${
                    paymentMethod === "efectivo"
                      ? "bg-mint text-white"
                      : "text-gray-700"
                  }`}
                >
                  Efectivo
                </button>

                <button
                  type="button"
                  className="mt-3 w-full max-w-72 cursor-pointer rounded-xl bg-mint-dark p-3 text-lg font-semibold text-white"
                >
                  Confirmar Cobro
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default PaymentMethod;
