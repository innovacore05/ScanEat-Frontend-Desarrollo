import { HiCheck } from "react-icons/hi";

type OrderClosedProps = {
  onStartNewSession: () => void;
};

export default function OrderClosed({
  onStartNewSession,
}: OrderClosedProps) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-black/50 px-6 py-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-finalizada-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-white shadow-xl">
        <div className="flex flex-col items-center bg-mint-dark px-6 py-8 text-center text-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white">
            <HiCheck className="h-9 w-9 text-mint-dark" aria-hidden="true" />
          </div>

          <h1
            id="order-finalizada-title"
            className="mt-5 text-2xl font-bold sm:text-3xl"
          >
            Orden pagada
          </h1>

          <p className="mt-2 text-sm text-white/85">
            Esta sesión del menú ya finalizó.
          </p>
        </div>

        <div className="px-6 py-7 text-center">
          <p className="text-base leading-relaxed text-text-primary">
            Para iniciar otro pedido, comienza una nueva sesión del menú.
          </p>

          <button
            type="button"
            onClick={onStartNewSession}
            className="mt-6 rounded-2xl bg-mint-dark px-5 py-3 text-sm font-semibold text-white hover:bg-mint-darker"
          >
            Iniciar nueva sesión
          </button>
        </div>
      </div>
    </div>
  );
}