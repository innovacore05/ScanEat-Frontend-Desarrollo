import { useEffect,useState, type ChangeEvent} from "react";
import DashboardLayoutAdmin from "../layout/DashboardLayoutAdmin";

import { IoSearch } from "react-icons/io5";

import { Link } from "@tanstack/react-router";
import CertificateUploader from "./CertificateUploader";
import { issuerService, getErrorMessage, type IssuerConfig } from "../../services/issuerService";
import { useGeography } from "../../hooks/useGeography";


const emptyForm: IssuerConfig=
{
  legalIdType: "",
  legalId: "",
  legalName: "",
  tradeName: "",
  activityCode: "",
  email: "",
  phone: "",
  province: "",
  canton: "",
  district: "",
  neighborhood: "",
  address: "",
  environment: "sandbox",
};



function IssuerInformation() {

const [form,setForm]=useState<IssuerConfig>(emptyForm);
const [hasConfig,setHasConfig]= useState(false);
const [certificateUploadedAt,setCertificateUploadedAt]=useState<string |null>(null);
 const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);


//hook de datos de provincia canton distrito
const {
  provinces,
  cantons: allCantons,
  districts: allDistricts,
  loading: loadingGeo,
  error: geoError,
} = useGeography();


const cantons = allCantons.filter((c) => c.parent_id === `CR${form.province}`);
const districts = allDistricts.filter(
  (d) => d.parent_id === `CR${form.province}${form.canton}`,
);

const load = async () => {
  try {
    const data = await issuerService.get();
    if (data) {
      setForm({
        legalIdType: data.legalIdType ?? "",
        legalId: data.legalId ?? "",
        legalName: data.legalName ?? "",
        tradeName: data.tradeName ?? "",
        activityCode: data.activityCode ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        province: data.province ?? "",
        canton: data.canton ?? "",
        district: data.district ?? "",
        neighborhood: data.neighborhood ?? "",
        address: data.address ?? "",
        environment: data.environment ?? "sandbox",
      });
      setHasConfig(true);
      setCertificateUploadedAt(data.certificateUploadedAt);
    }
  } catch (error) {
    console.error("Error cargando datos del emisor", error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  void load();
}, []);

 const handleChange = async (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

  if (name === "province") {
    // al cambiar provincia se limpian canton y distrito
    setForm((prev) => ({ ...prev, province: value, canton: "", district: "" }));
  } else if (name === "canton") {
    // al cambiar canton se limpia el distrito
    setForm((prev) => ({ ...prev, canton: value, district: "" }));
  } else {
    setForm((prev) => ({ ...prev, [name]: value }));
  }
};

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await issuerService.save(form);
      await load();
      setFeedback({ type: "ok", text: "Datos guardados correctamente" });
    } catch (error) {
      setFeedback({
        type: "error",
        text: getErrorMessage(error, "No se pudieron guardar los datos"),
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayoutAdmin>
        <p className="p-15">Cargando…</p>
      </DashboardLayoutAdmin>
    );
  }


  return (
    <DashboardLayoutAdmin>
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
  name="legalIdType"
  value={form.legalIdType}
  onChange={handleChange}
  className="w-full rounded-lg border border-border bg-white px-4 py-3 text-text-primary outline-none focus:border-2 focus:border-brown"
>
                  <option value="" disabled>
                    Seleccioná un tipo
                  </option>
                  <option value="01">Cédula física</option>
                  <option value="02">Cédula jurídica</option>
                  <option value="03">DIMEX</option>
                  <option value="04">NITE</option>
                </select>
              </div>

              <div>
                <h2 className="mb-2 font-semibold">
                  Cédula del emisor *
                </h2>

                <div className="flex gap-2">
                  <input
                   type="text"
                    name="legalId"
                    maxLength={12}
                    value={form.legalId}
                    onChange={handleChange}
                    placeholder="Solo números, sin guiones"
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
  name="legalName"
  value={form.legalName}
  onChange={handleChange}
  className="w-full rounded-lg border border-border px-4 py-3 pr-12 text-text-primary outline-none focus:border-2 focus:border-brown"
/>
            </div>

            <div>
              <h2 className="mb-2 font-semibold">
                Nombre comercial *
              </h2>

              <input
                type="text"
                name="tradeName"
                value={form.tradeName}
                onChange={handleChange}
                className="w-full rounded-lg border border-border px-4 py-3 pr-12 text-text-primary outline-none focus:border-2 focus:border-brown"
              />
            </div>

            <div>
              <h2 className="mb-2 font-semibold">
                Actividades económicas *
              </h2>

              <input
                type="text"
                name="activityCode"
                maxLength={8}
                placeholder=" "
                value={form.activityCode}
                onChange={handleChange}
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
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
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
                    name="phone"
                    maxLength={8}
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-border px-4 py-3 pr-12 text-text-primary outline-none focus:border-2 focus:border-brown"
                   />
                </div>
              </div>
            </div>
          </div>

{/* UBICACION */}

<div className="mb-8 flex flex-col gap-5">
  <h2 className="text-xl font-bold text-black">Ubicación</h2> 

<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
<div>
   <h3 className="mb-2 font-semibold">
                  Provincia
                </h3>
 <select
                  name="province"
                  value={form.province}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-white px-4 py-3 text-text-primary outline-none focus:border-2 focus:border-brown"
                >
                  <option value="">Seleccione Provincia</option>
                  {provinces.map((p) => (
  <option key={p.id} value={p.id.slice(2)}>{p.name_local}</option>
))}
                </select>
</div>

              <div>
                <h3 className="mb-2 font-semibold">
                  Cantón
                </h3>

                <select
                  name="canton"
                  value={form.canton}
                  onChange={handleChange}
                  disabled={!form.province || loadingGeo}
                  className="w-full rounded-lg border border-border bg-white px-4 py-3 text-text-primary outline-none focus:border-2 focus:border-brown disabled:opacity-50 disabled:bg-gray-50"
                >
                  <option value="">
                    {loadingGeo ? "Cargando..." : !form.province ? "Primero provincia" : "Seleccione Cantón"}
                  </option>
                  {cantons.map((c) => (
  <option key={c.id} value={c.id.slice(3)}>{c.name_local}</option>
))}
                </select>
              </div>

              <div>          
                 <h3 className="mb-2 font-semibold">Distrito</h3>
                <select
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  disabled={!form.canton || loadingGeo}
                  className="w-full rounded-lg border border-border bg-white px-4 py-3 text-text-primary outline-none focus:border-2 focus:border-brown disabled:opacity-50 disabled:bg-gray-50"
                >
                  <option value="">
                    {loadingGeo ? "Cargando..." : !form.canton ? "Primero cantón" : "Seleccione Distrito"}
                  </option>
                  {districts.map((d) => (
  <option key={d.id} value={d.id.slice(5)}>{d.name_local}</option>
))}
                </select>
              </div>
            </div>

{geoError && (
  <p className="text-sm font-semibold text-red-600">
    No se pudieron cargar las ubicaciones. Recargá la página.
  </p>
)}

            <div>
              <h3 className="mb-2 font-semibold">
                Barrio (opcional)
              </h3>

              <input
                 type="text"
                name="neighborhood"
                maxLength={50}
                placeholder="San Francisco"
                value={form.neighborhood}
                onChange={handleChange}
                className="w-full rounded-lg border border-border px-4 py-3 pr-12 text-text-primary outline-none focus:border-2 focus:border-brown"
              />
            </div>

            <div>
              <h3 className="mb-2 font-semibold">
                Dirección exacta (otras señas) *
              </h3>

              <input
                type="text"
                name="address"
                maxLength={250}
                placeholder="200 m sur de la iglesia, casa azul..."
                value={form.address}
                onChange={handleChange}
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

  <select
                name="environment"
                value={form.environment}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-text-primary outline-none focus:border-2 focus:border-brown"
              >
                <option value="sandbox">Pruebas (sandbox)</option>
                <option value="production">Producción</option>
              </select>
            </div>
          </div>

          {/* Certificado y credenciales: se envían a Factura en CR, no se guardan */}
          <CertificateUploader
            uploadedAt={certificateUploadedAt}
            disabled={!hasConfig}
            onUploaded={() => void load()}
          />

          {feedback && (
            <p
              className={`mt-6 text-sm font-semibold ${
                feedback.type === "ok" ? "text-mint-dark" : "text-red-600"
              }`}
            >
              {feedback.text}
            </p>
          )}

          <div className="mt-10 flex flex-col-reverse gap-4 sm:flex-row sm:justify-end">
            <Link
              to="/dashboardAdmin"
              className="text-center rounded-lg border border-border px-6 py-2 font-semibold"
            >
              Cancelar
            </Link>

            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSave()}
              className="rounded-lg border border-border bg-mint-dark px-6 py-2 font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>
      </main>
    </DashboardLayoutAdmin>
  );
 }


export default IssuerInformation;


//ESTO SE PASO A CERTIFICATEUPLOADER
//               <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                 <div>
//                   <h3 className="mb-2 font-semibold">
//                     Ambiente
//                   </h3>

//                   <input
//                     type="text"
//                     className="w-full rounded-lg border border-border px-4 py-3 pr-12 text-text-primary outline-none focus:border-2 focus:border-brown"
//                   />
//                 </div>

//                 <div>
//                   <h3 className="mb-2 font-semibold">
//                     Alias (opcional)
//                   </h3>

//                   <input
//                     type="text"
//                     className="w-full rounded-lg border border-border px-4 py-3 pr-12 text-text-primary outline-none focus:border-2 focus:border-brown"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <h3 className="mb-2 mt-5 font-semibold">
//                   Certificado .p12 *
//                 </h3>

//                 <label
//                   htmlFor="certificate"
//                   className="flex w-full cursor-pointer items-center rounded-lg border border-border px-4 py-3 text-text-primary hover:border-brown"
//                 >
//                   <AiOutlineCloudUpload className="mr-2 h-6 w-6 text-gray-500" />
//                   <span>Seleccioná el archivo .p12</span>
//                 </label>

//                 <input
//                   id="certificate"
//                   type="file"
//                   accept=".p12"
//                   className="hidden"
//                 />
//               </div>

//               <div className="mt-5 w-100">
//                 <h3 className="mb-2 font-semibold">
//                   Contraseña del .p12 *
//                 </h3>

//                 <input
//                   type="password"
//                   className="w-full rounded-lg border border-border px-4 py-3 pr-12 text-text-primary outline-none focus:border-2 focus:border-brown"
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="mb-8 rounded-lg border border-border bg-gray-50">
//             <div className="p-6">
//               <h3 className="text-xl font-bold text-black">
//                 Credenciales de Hacienda (TRIBU-CR)
//               </h3>

//               <p className="mt-2 text-sm text-text-primary">
//                 No es el correo ni la clave con la que entrás a TRIBU-CR.
//                 Es un par aparte que se baja desde Tico Factura, con la
//                 opción «Descargar usuario y contraseña».
//               </p>

//               <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
//                 <div>
//                   <h3 className="mb-2 font-semibold">
//                     Usuario Hacienda (TRIBU-CR) *
//                   </h3>

//                   <input
//                     type="text"
//                     className="w-full rounded-lg border border-border px-4 py-3 pr-12 text-text-primary outline-none focus:border-2 focus:border-brown"
//                   />
//                 </div>

//                 <div>
//                   <h3 className="mb-2 font-semibold">
//                     Contraseña Hacienda (TRIBU-CR) *
//                   </h3>

//                   <input
//                     type="password"
//                     className="w-full rounded-lg border border-border px-4 py-3 pr-12 text-text-primary outline-none focus:border-2 focus:border-brown"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="mt-10 flex flex-col-reverse gap-4 sm:flex-row sm:justify-end">
//             <Link
//               to="/dashboardAdmin"
//               type="button"
//               className="text-center rounded-lg border border-border px-6 py-2 font-semibold"
//             >
//               Cancelar
//             </Link>

//             <button
//               type="button"
//               className=" rounded-lg border border-border bg-mint-dark px-6 py-2 font-semibold text-white"
//             >
//               Guardar
//             </button>
//           </div>
//         </div>
//       </main>
//     </DashboardLayoutAdmin>
//   );
// }

