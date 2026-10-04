import DashboardLayout from "../../components/layout/DashboardLayout";
import { LuPlus } from "react-icons/lu";
import { IoSearch } from "react-icons/io5";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { Link } from "@tanstack/react-router";

function IssuerInformation() {
  return (
    <DashboardLayout>
      <main className="min-h-screen bg-brand-white p-15">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-black">
              Datos del emisor
            </h1>
          </div>

          <div className="mb-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h2 className="mb-2 font-semibold">
                  Tipo identificación
                </h2>

                <select
                  defaultValue=""
                  className="w-full rounded-lg border border-border bg-white px-4 py-3 text-text-primary outline-none focus:border-2 focus:border-brown"
                >
                  <option value="" disabled>
                    Seleccioná un tipo
                  </option>
                  <option value="fisica">Cédula física</option>
                  <option value="juridica">Cédula jurídica</option>
                  <option value="dimex">DIMEX</option>
                  <option value="nite">NITE</option>
                </select>
              </div>

              <div>
                <h2 className="mb-2 font-semibold">
                  Cédula del emisor *
                </h2>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ingrese el número de identificación"
                    className="w-full rounded-lg border border-border px-4 py-3 pr-12 text-text-primary outline-none focus:border-2 focus:border-brown"
                  />

                  <div className="flex w-15 shrink-0 items-center justify-center rounded-lg border border-border p-3 text-text-primary">
                    <IoSearch className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 flex flex-col gap-5">
            <div>
              <h2 className="mb-2 font-semibold">
                Nombre / Razón Social *
              </h2>

              <input
                type="text"
                className="w-full rounded-lg border border-border px-4 py-3 pr-12 text-text-primary outline-none focus:border-2 focus:border-brown"
              />
            </div>

            <div>
              <h2 className="mb-2 font-semibold">
                Nombre comercial *
              </h2>

              <input
                type="text"
                className="w-full rounded-lg border border-border px-4 py-3 pr-12 text-text-primary outline-none focus:border-2 focus:border-brown"
              />
            </div>

            <div>
              <h2 className="mb-2 font-semibold">
                Actividades económicas *
              </h2>

              <input
                type="text"
                className="w-full rounded-lg border border-border px-4 py-3 pr-12 text-text-primary outline-none focus:border-2 focus:border-brown"
              />
            </div>
          </div>

          <div className="mb-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h2 className="mb-2 font-semibold">
                  Correo principal *
                </h2>

                <input
                  type="text"
                  className="w-full rounded-lg border border-border px-4 py-3 pr-12 text-text-primary outline-none focus:border-2 focus:border-brown"
                />
              </div>

              <div>
                <h2 className="mb-2 font-semibold">
                  Teléfono *
                </h2>

                <div className="flex gap-2">
                  <p className="flex w-14 shrink-0 items-center justify-center rounded-lg border border-border px-4 py-3">
                    506
                  </p>

                  <input
                    type="text"
                    className="w-full rounded-lg border border-border px-4 py-3 pr-12 text-text-primary outline-none focus:border-2 focus:border-brown"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <div className="flex items-center gap-20">
              <h2 className="font-semibold">
                Otros correos
              </h2>

              <button
                type="button"
                className="flex cursor-pointer items-center gap-1 font-semibold text-mint-darker hover:underline"
              >
                <LuPlus className="h-5 w-5" />
                Agregar
              </button>
            </div>
          </div>

          <div className="mb-8 flex flex-col gap-5">
            <h2 className="text-xl font-bold text-black">
              Ubicación *
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <h3 className="mb-2 font-semibold">
                  Provincia
                </h3>

                <input
                  type="text"
                  className="w-full rounded-lg border border-border px-4 py-3 pr-12 text-text-primary outline-none focus:border-2 focus:border-brown"
                />
              </div>

              <div>
                <h3 className="mb-2 font-semibold">
                  Cantón
                </h3>

                <input
                  type="text"
                  className="w-full rounded-lg border border-border px-4 py-3 pr-12 text-text-primary outline-none focus:border-2 focus:border-brown"
                />
              </div>

              <div>
                <h3 className="mb-2 font-semibold">
                  Distrito
                </h3>

                <input
                  type="text"
                  className="w-full rounded-lg border border-border px-4 py-3 pr-12 text-text-primary outline-none focus:border-2 focus:border-brown"
                />
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">
                Barrio (opcional)
              </h3>

              <input
                type="text"
                placeholder="San Francisco"
                className="w-full rounded-lg border border-border px-4 py-3 pr-12 text-text-primary outline-none focus:border-2 focus:border-brown"
              />
            </div>

            <div>
              <h3 className="mb-2 font-semibold">
                Dirección exacta (otras señas) *
              </h3>

              <input
                type="text"
                placeholder="200 m sur de la iglesia, casa azul..."
                className="w-full rounded-lg border border-border px-4 py-3 pr-12 text-text-primary outline-none focus:border-2 focus:border-brown"
              />

              <p className="mt-2 text-sm font-semibold text-red-600">
                Obligatorio: el XML del emisor lleva la dirección exacta.
              </p>
            </div>
          </div>

          <div className="mb-8 rounded-lg border border-border bg-gray-50">
            <div className="p-6">
              <h2 className="mb-5 text-xl font-bold text-black">
                Ambiente
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 font-semibold">
                    Ambiente
                  </h3>

                  <input
                    type="text"
                    className="w-full rounded-lg border border-border px-4 py-3 pr-12 text-text-primary outline-none focus:border-2 focus:border-brown"
                  />
                </div>

                <div>
                  <h3 className="mb-2 font-semibold">
                    Alias (opcional)
                  </h3>

                  <input
                    type="text"
                    className="w-full rounded-lg border border-border px-4 py-3 pr-12 text-text-primary outline-none focus:border-2 focus:border-brown"
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-2 mt-5 font-semibold">
                  Certificado .p12 *
                </h3>

                <label
                  htmlFor="certificate"
                  className="flex w-full cursor-pointer items-center rounded-lg border border-border px-4 py-3 text-text-primary hover:border-brown"
                >
                  <AiOutlineCloudUpload className="mr-2 h-6 w-6 text-gray-500" />
                  <span>Seleccioná el archivo .p12</span>
                </label>

                <input
                  id="certificate"
                  type="file"
                  accept=".p12"
                  className="hidden"
                />
              </div>

              <div className="mt-5 w-100">
                <h3 className="mb-2 font-semibold">
                  Contraseña del .p12 *
                </h3>

                <input
                  type="password"
                  className="w-full rounded-lg border border-border px-4 py-3 pr-12 text-text-primary outline-none focus:border-2 focus:border-brown"
                />
              </div>
            </div>
          </div>

          <div className="mb-8 rounded-lg border border-border bg-gray-50">
            <div className="p-6">
              <h3 className="text-xl font-bold text-black">
                Credenciales de Hacienda (TRIBU-CR)
              </h3>

              <p className="mt-2 text-sm text-text-primary">
                No es el correo ni la clave con la que entrás a TRIBU-CR.
                Es un par aparte que se baja desde Tico Factura, con la
                opción «Descargar usuario y contraseña».
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 font-semibold">
                    Usuario Hacienda (TRIBU-CR) *
                  </h3>

                  <input
                    type="text"
                    className="w-full rounded-lg border border-border px-4 py-3 pr-12 text-text-primary outline-none focus:border-2 focus:border-brown"
                  />
                </div>

                <div>
                  <h3 className="mb-2 font-semibold">
                    Contraseña Hacienda (TRIBU-CR) *
                  </h3>

                  <input
                    type="password"
                    className="w-full rounded-lg border border-border px-4 py-3 pr-12 text-text-primary outline-none focus:border-2 focus:border-brown"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col-reverse gap-4 sm:flex-row sm:justify-end">
            <Link
              to="/dashboard"
              type="button"
              className="rounded-lg border border-border px-6 py-2 font-semibold"
            >
              Cancelar
            </Link>

            <button
              type="button"
              className="rounded-lg border border-border bg-mint-dark px-6 py-2 font-semibold text-white"
            >
              Guardar
            </button>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}

export default IssuerInformation;