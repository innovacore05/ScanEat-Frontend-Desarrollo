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
const [lookingUp, setLookingUp] = useState(false);
const [activityOptions, setActivityOptions] = useState<
  { code: string; description: string }[]
>([]);
const [chargesVat, setChargesVat] = useState<boolean | null>(null);
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
    const result = await issuerService.save(form);
    await load();

    if (result.certificateInvalidated) {
      setFeedback({
        type: "error",
        text: "Guardado. Cambió la cédula o el ambiente: volvé a subir el certificado.",
      });
    } else if (!result.regimeVerified) {
      setFeedback({
        type: "error",
        text: "Guardado, pero no se pudo verificar el régimen en Hacienda. Intentá guardar de nuevo.",
      });
    } else {
      setFeedback({ type: "ok", text: "Datos guardados correctamente" });
    }
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
        <p className="p-4 sm:p-6 lg:p-15">Cargando…</p>
      </DashboardLayoutAdmin>
    );
  }

  //para busacr el contribuyente:
  const handleLookup = async () => {
  const id = form.legalId.trim();
  if (!id) return;
  setLookingUp(true);
  setFeedback(null);
  setActivityOptions([]);
  try {
    const result = await issuerService.lookupTaxpayer(id);
    setForm((prev) => ({
      ...prev,
      legalName: result.legalName ?? prev.legalName,
      tradeName: result.tradeName ?? prev.tradeName,
      legalIdType: result.legalIdType,
      // la principal viene primero
      activityCode: result.activities[0]?.code ?? prev.activityCode,
    }));
    if (result.activities.length > 1) setActivityOptions(result.activities);

    if (result.registered === false || result.canIssue === false) {
      setFeedback({
        type: "error",
        text: "Hacienda indica que este contribuyente no puede emitir comprobantes. Revisá su situación en TRIBU-CR.",
      });
    } else if (!result.hasCommercialActivity) {
      setFeedback({
        type: "error",
        text: "Esta cédula no tiene una actividad económica comercial inscrita en Hacienda. El negocio debe registrar su actividad en TRIBU-CR antes de poder emitir comprobantes.",
      });
   } else if (result.chargesVat === false) {
  setFeedback({
    type: "ok",
    text: " 0",
  });
}
  } catch (error) {
    setFeedback({
      type: "error",
      text: getErrorMessage(error, "No se pudo consultar la cédula"),
    });
  } finally {
    setLookingUp(false);
  }
};

  return (
    <DashboardLayoutAdmin>
      <main className="min-h-screen bg-brand-white p-4 sm:p-6 lg:p-15">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-black sm:text-3xl">
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

                  <button
  type="button"
  onClick={() => void handleLookup()}
  disabled={lookingUp || !form.legalId.trim()}
  aria-label="Consultar cédula en Hacienda"
  className="flex w-15 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border p-3 text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
>
  <IoSearch className="h-6 w-6" />
</button>

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

              {activityOptions.length > 1 && (
  <select
    value={form.activityCode}
    onChange={(e) =>
      setForm((prev) => ({ ...prev, activityCode: e.target.value }))
    }
    className="mt-2 w-full rounded-lg border border-border bg-white px-4 py-3 text-text-primary"
  >
    <option value="">Elegí una actividad</option>
    {activityOptions.map((a) => (
      <option key={a.code} value={a.code}>
        {a.code} — {a.description}
      </option>
    ))}
  </select>

  
)}

<p className="mt-3 text-sm font-semibold">
  Régimen:{" "}
  {chargesVat === null
    ? "sin verificar"
    : chargesVat
      ? "Tradicional (traslada IVA)"
      : "Simplificado (IVA en 0)"}
</p>
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
