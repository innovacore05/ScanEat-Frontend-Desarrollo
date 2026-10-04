import { useState } from "react";
import { ImEye, ImEyeBlocked } from "react-icons/im";
import { BsFillArrowLeftCircleFill } from "react-icons/bs";
import { FaRegCheckCircle } from "react-icons/fa";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { Link, useNavigate } from "@tanstack/react-router";
import { changePassword } from "../../services/authService";
import DashboardLayout from "../layout/DashboardLayout";


function ChangePasswordForm() {
  const navigate = useNavigate();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!currentPassword.trim()) {
      setError("Ingresa tu contraseña actual.");
      return;
    }

    if (!newPassword.trim()) {
      setError("Ingresa una nueva contraseña.");
      return;
    }

    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (!/\d/.test(newPassword)) {
      setError("La contraseña debe contener al menos un número.");
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>_\/+=;`~\[\]\\-]/.test(newPassword)) {
      setError("La contraseña debe contener al menos un símbolo.");
      return;
    }

    if (!confirmPassword.trim()) {
      setError("Confirma tu nueva contraseña.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
if (newPassword === currentPassword) {
  setError("La nueva contraseña debe ser diferente a la actual.");
  return;
}
setIsSubmitting(true);

    try {
      await changePassword(currentPassword, newPassword, confirmPassword);
      setShowSuccess(true);
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message)
          : "No se pudo cambiar la contraseña.";

      setError(message);
      setShowError(true);
    }
    finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
    <DashboardLayout>
        
    <main className="min-h-screen bg-white mt-22">
      

      <section className="-mt-10 min-h-[calc(100vh-5rem)] bg-white px-6 py-10">
        <form
          className="mx-auto flex w-full max-w-sm flex-col"
          onSubmit={handleSubmit}
        >
          <h1 className="text-center text-[32px] font-bold text-mint-dark">
            Cambiar contraseña
          </h1>

          <div className="relative mt-10">
            <input
              id="currentPassword"
              name="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Contraseña actual"
              value={currentPassword}
              onChange={(event) => {
                setCurrentPassword(event.target.value);
                setError("");
              }}
              className="w-full rounded-lg border border-border px-4 py-3 pr-12 text-text-primary outline-none focus:border-2 focus:border-brown"
            />

            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-mint-dark"
            >
              {showCurrentPassword ? <ImEye /> : <ImEyeBlocked />}
            </button>
          </div>

          <div className="relative mt-5">
            <input
              id="newPassword"
              name="newPassword"
              type={showNewPassword ? "text" : "password"}
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value);
                setError("");
              }}
              className="w-full rounded-lg border border-border px-4 py-3 pr-12 text-text-primary outline-none focus:border-2 focus:border-brown"
            />

            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-mint-dark"
            >
              {showNewPassword ? <ImEye /> : <ImEyeBlocked />}
            </button>
          </div>

          <div className="relative mt-5">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setError("");
              }}
              className="w-full rounded-lg border border-border px-4 py-3 pr-12 text-text-primary outline-none focus:border-2 focus:border-brown"
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-mint-dark"
            >
              {showConfirmPassword ? <ImEye /> : <ImEyeBlocked />}
            </button>
          </div>

          {error && (
            <p className="mt-4 text-center text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            className="mt-12 w-full cursor-pointer rounded-lg bg-mint-dark px-4 py-3 text-center text-base font-bold text-white hover:bg-mint-dark/90"
          >
           {isSubmitting ? "Cambiando..." : "Cambiar contraseña"}
          </button>

          <Link
            to="/profileSettings"
            className="mt-6 block w-full cursor-pointer rounded-lg border border-mint-dark px-4 py-3 text-center text-base font-bold text-mint-dark hover:bg-mint-dark/10"
          >
            Cancelar
          </Link>
        </form>
      </section>
      </main>
    </DashboardLayout>
    
    {showSuccess ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-sm rounded-[40px] bg-white px-8 py-16 text-center">

            <FaRegCheckCircle className="mx-auto h-20 w-20 text-mint-dark" />

            <h1 className="mt-8 text-2xl font-bold text-mint-dark">
              ¡Éxito!
            </h1>

            <p className="mt-4 text-text-primary">
              Tu contraseña ha sido cambiada correctamente.
            </p>

            <button
              type="button"
              onClick={() => navigate({ to: "/profileSettings" })}
              className="mt-8 cursor-pointer font-bold text-mint-dark hover:underline"
            >
              Aceptar
            </button>

          </div>
        </div>
      ) : null}

      {showError ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-sm rounded-[40px] bg-white px-8 py-16 text-center">

            <AiOutlineExclamationCircle className="mx-auto h-20 w-20 text-pink" />

            <h1 className="mt-8 text-2xl font-bold text-pink">
              Problema inesperado
            </h1>

            <p className="mt-4 text-text-primary">
              {error}
            </p>

            <button
              type="button"
              onClick={() => {
                setShowError(false);
                setError("");
              }}
              className="mt-8 cursor-pointer text-mint"
              aria-label="Volver a cambiar contraseña"
            >
              <BsFillArrowLeftCircleFill className="mx-auto h-10 w-10" />
            </button>

          </div>
        </div>
      ) : null}
      </>
    
  );
}

export default ChangePasswordForm;