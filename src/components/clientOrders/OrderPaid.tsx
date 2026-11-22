import { HiCheck } from "react-icons/hi";

export default function OrderPaid() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
        <div className="flex flex-col items-center bg-mint-dark px-6 py-8 text-center text-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-neutral-700 shadow-sm">
            <HiCheck className="h-9 w-9" aria-hidden="true" />
          </div>

          <h1 className="mt-5 text-2xl font-bold sm:text-3xl">
            ¡Gracias por visitarnos!
          </h1>

          <p className="mt-2 text-sm text-white/85">
            Tu pago se completó correctamente.
          </p>
        </div>

        <div className="px-6 py-7 text-center">
          <p className="text-base leading-relaxed text-text-primary">
            La orden quedó cerrada. Esperamos verte pronto.
          </p>
        </div>
      </div>
    </main>
  );
}