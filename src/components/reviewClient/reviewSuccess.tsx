
import { HiCheck, HiStar } from "react-icons/hi";
export default function ReviewSuccess(){
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
        <div className="flex flex-col items-center bg-mint-dark px-6 py-8 text-center text-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-neutral-700 shadow-sm">
            <HiCheck className="h-9 w-9 text-mint-dark" aria-hidden="true" />
          </div>

          <h1 className="mt-5 text-2xl font-bold sm:text-3xl">
            ¡Gracias por tu opinión!
          </h1>
          <p className="mt-2 text-sm text-white/85">
            Tu experiencia nos ayuda a seguir mejorando.
          </p>
        </div>

        <div className="px-6 py-7 text-center">
          <div className="flex justify-center gap-1 text-amber-300">
            {Array.from({ length: 5 }, (_, index) => (
              <HiStar key={index} className="h-6 w-6" aria-hidden="true" />
            ))}
          </div>

          <p className="mt-5 text-base leading-relaxed text-text-primary">
            Tu reseña ha sido enviada correctamente.
          </p>

          <div className="mt-3 rounded-2xl  px-4 py-3">
            <p className="text-sm font-semibold text-mint-dark">
              Tu pedido está listo para pagar.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}