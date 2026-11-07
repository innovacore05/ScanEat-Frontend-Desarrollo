import { LuQrCode } from "react-icons/lu";
function InvalidTableScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#effaf5] px-5 py-10">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-lg sm:p-10">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-[#d9f3e7]">
          <LuQrCode
            className="h-14 w-14 text-mint-darker"
            aria-hidden="true"
          />
        </div>

        <h1 className="text-2xl font-bold text-mint-darker sm:text-3xl">
          ¡Escaneá el código QR de tu mesa!
        </h1>

        <p className="mt-4 text-base leading-relaxed text-text-primary">
          Para consultar nuestro menú y realizar tu pedido, necesitás escanear
          el código QR que se encuentra en tu mesa.
        </p>

        <div className="mt-7 rounded-xl bg-[#effaf5] p-4 text-left">
          <p className="font-semibold text-mint-darker">
            ¿Cómo ingresar?
          </p>
          <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-text-primary">
            <li>Abrí la cámara de tu celular.</li>
            <li>Apuntá al código QR de tu mesa.</li>
            <li>Ingresá al enlace para consultar el menú.</li>
          </ol>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          Si necesitás ayuda, consultá con nuestro personal.
        </p>
      </section>
    </main>
  );
}

export default InvalidTableScreen;
