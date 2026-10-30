//esta funcion se crea especificamente con el proposito de
//lograr subir los documentos p12 y el pin sin tener que manipularlo en la bd
//para evitar manipular data sensible
//se separa del issuerInformation porque tiene el proposito de usar 
//los datos sensibles , solo apra verifiarlos
//el issuerInformaction guarda datos a la bd
//aca se sube los documentos
//al abrirlo arma un form con selector de archivo -12, el pin , el usuario de tibu y contrasena
//sube certificado
//de issuer information vienen
//la fecha de carga, verifgicacion de los datos del usaaurio de hacienda,
import { useRef, useState } from "react";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { issuerService, getErrorMessage } from "../../services/issuerService";

const inputClass =
  "w-full rounded-lg border border-border px-4 py-3 text-text-primary outline-none focus:border-2 focus:border-brown";

type Props = {
  uploadedAt: string | null;
  disabled: boolean;
  onUploaded: () => void;
};

function CertificateUploader({ uploadedAt, disabled, onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [p12Password, setP12Password] = useState("");
  const [haciendaUsername, setHaciendaUsername] = useState("");
  const [haciendaPassword, setHaciendaPassword] = useState("");
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);

  const ready = file && p12Password && haciendaUsername && haciendaPassword;
const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
  if (!file) return;

  setUploading(true);
  setFeedback(null);

  try {
    const body = new FormData();
    body.append("p12", file);
    body.append("p12Password", p12Password);
    body.append("haciendaUsername", haciendaUsername);
    body.append("haciendaPassword", haciendaPassword);

    await issuerService.uploadCertificate(body);

    setFeedback({
      type: "ok",
      text: "Certificado enviado correctamente",
    });

    onUploaded();
  } catch (error) {
    setFeedback({
      type: "error",
      text: getErrorMessage(error, "No se pudo subir el certificado"),
    });
  } finally {
    setFile(null);
    setP12Password("");
    setHaciendaUsername("");
    setHaciendaPassword("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setUploading(false);
  }
};

  return (
    <div className="mb-8 rounded-lg border border-border bg-gray-50 p-6">
      <h2 className="text-xl font-bold text-black">
        Certificado y credenciales de Hacienda
      </h2>

      {uploadedAt && (
        <p className="mt-3 text-sm font-semibold text-mint-dark">
          Certificado cargado el {new Date(uploadedAt).toLocaleString("es-CR")}.
          Subí otro solo si necesitás reemplazarlo.
        </p>
      )}
      {disabled && (
        <p className="mt-3 text-sm font-semibold text-red-600">
          Guardá primero los datos del emisor.
        </p>
      )}

      <div className="mt-5">
        <h3 className="mb-2 font-semibold">Certificado .p12 *</h3>
        <label
          htmlFor="certificate"
          className="flex w-full cursor-pointer items-center rounded-lg border border-border px-4 py-3 text-text-primary hover:border-brown"
        >
          <AiOutlineCloudUpload className="mr-2 h-6 w-6 text-gray-500" />
          <span>{file?.name ?? "Seleccioná el archivo .p12"}</span>
        </label>
        <input
  ref={fileInputRef}
  id="certificate"
  type="file"
  accept=".p12"
  className="hidden"
  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
/>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block font-semibold">PIN del .p12 *</span>
          <input
            type="password"
            autoComplete="new-password"
            value={p12Password}
            onChange={(e) => setP12Password(e.target.value)}
            className={inputClass}
          />
        </label>
        <div />
        <label className="block">
          <span className="mb-2 block font-semibold">
            Usuario Hacienda (TRIBU-CR) *
          </span>
          <input
            type="text"
            autoComplete="off"
            value={haciendaUsername}
            onChange={(e) => setHaciendaUsername(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-2 block font-semibold">
            Contraseña Hacienda (TRIBU-CR) *
          </span>
          <input
            type="password"
            autoComplete="new-password"
            value={haciendaPassword}
            onChange={(e) => setHaciendaPassword(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      {feedback && (
        <p
          className={`mt-4 text-sm font-semibold ${
            feedback.type === "ok" ? "text-mint-dark" : "text-red-600"
          }`}
        >
          {feedback.text}
        </p>
      )}

      <button
        type="button"
        disabled={disabled || !ready || uploading}
        onClick={() => void handleUpload()}
        className="mt-5 cursor-pointer rounded-lg border border-border bg-mint-dark px-6 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploading ? "Subiendo…" : "Subir certificado"}
      </button>
    </div>
  );
}

export default CertificateUploader;