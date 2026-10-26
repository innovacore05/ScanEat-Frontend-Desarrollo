import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

export default function SessionExpiredScreen() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleSessionExpired = () => {
      localStorage.removeItem("authUser");
      setIsVisible(true);
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener(
        "auth:session-expired",
        handleSessionExpired,
      );
    };
  }, []);

  const handleLogin = () => {
    setIsVisible(false);
    void navigate({ to: "/login" });
  };

  if (!isVisible) return null;

  return (
    <main className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-neutral-50 px-6 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
        <div className="flex flex-col items-center bg-mint-dark px-6 py-8 text-center text-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl font-bold text-mint-dark shadow-sm">
            !
          </div>

          <h1 className="mt-5 text-2xl font-bold sm:text-3xl">
            Tu sesión ya no está disponible
          </h1>

          <p className="mt-2 text-sm text-white/85">
            La cookie de sesión pudo haber expirado o no llegó al servidor.
          </p>
        </div>

        <div className="px-6 py-7 text-center">
          <p className="text-base leading-relaxed text-text-primary">
            Vuelve a iniciar sesión para continuar.
          </p>

          <button
            type="button"
            onClick={handleLogin}
            className="mt-6 rounded-2xl bg-mint-dark px-5 py-3 text-sm font-semibold text-white hover:bg-mint-darker"
          >
            Volver a iniciar sesión
          </button>
        </div>
      </div>
    </main>
  );
}