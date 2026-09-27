import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { FiCamera } from "react-icons/fi";
import { Link } from "@tanstack/react-router";
import { HiArrowLeft } from "react-icons/hi";
import ColorPickerField from "./ColorPickerField";
import { useTheme } from "../../contexts/ThemeContext";
import {
  AVAILABLE_FONTS,
  DEFAULT_THEME,
  isValidHexColor,
  type RestaurantFont,
} from "../../config/restaurantTheme";
import {
  uploadRestaurantLogo,
} from "../../services/themeService";
import { getProfile } from "../../services/authService";
import DashboardLayout from "../layout/DashboardLayout";

function ThemeCustomizer() {
  const { theme, saveTheme } = useTheme();

  const [primaryColor, setPrimaryColor] = useState(
    theme.primaryColor,
  );

  const [secondaryColor, setSecondaryColor] =
    useState(theme.secondaryColor);

  const [fontFamily, setFontFamily] =
    useState<RestaurantFont>(theme.fontFamily);

  const [logoPreview, setLogoPreview] = useState(
    theme.logoUrl || "/img/LogoS.svg",
  );

  const [logoFile, setLogoFile] =
    useState<File | null>(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setMessage("");
    }, 2000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [message]);

  useEffect(() => {
    setPrimaryColor(theme.primaryColor);
    setSecondaryColor(theme.secondaryColor);
    setFontFamily(theme.fontFamily);
    setLogoPreview(theme.logoUrl || "/img/LogoS.svg");
  }, [
    theme.primaryColor,
    theme.secondaryColor,
    theme.fontFamily,
    theme.logoUrl,
  ]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const colors = [primaryColor, secondaryColor];

      if (
        colors.some(
          (color) => !isValidHexColor(color),
        )
      ) {
        throw new Error(
          "Todos los colores deben ser válidos.",
        );
      }

      const profile = await getProfile();
      const businessId = profile.business?.businessId;

      if (!businessId) {
        throw new Error(
          "No se encontró el restaurante.",
        );
      }

      let logoUrl = theme.logoUrl;

      if (logoFile) {
        const logoResponse =
          await uploadRestaurantLogo(
            businessId,
            logoFile,
          );

        logoUrl = logoResponse.logoUrl;
      }

      await saveTheme({
        primaryColor,
        secondaryColor,
        fontFamily,
        logoUrl,
      });

      setLogoFile(null);
      setMessage(
        "Personalización guardada correctamente.",
      );
    } catch (error) {
      console.error(
        "Error guardando personalización:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la personalización.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function restoreDefaults() {
    setPrimaryColor(DEFAULT_THEME.primaryColor);
    setSecondaryColor(DEFAULT_THEME.secondaryColor);
    setFontFamily(DEFAULT_THEME.fontFamily);
    setLogoFile(null);
    setLogoPreview("/img/LogoS.svg");
    setError("");
    setMessage("");

    try {
      setIsSaving(true);

      await saveTheme({
        primaryColor: DEFAULT_THEME.primaryColor,
        secondaryColor: DEFAULT_THEME.secondaryColor,
        fontFamily: DEFAULT_THEME.fontFamily,
        logoUrl: null,
      });

      setMessage("Valores originales restaurados.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudieron restaurar los valores.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleLogoChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0] ?? null;

    setLogoFile(file);

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    } else {
      setLogoPreview(
        theme.logoUrl || "/img/LogoS.svg",
      );
    }
  }

  return (
    <DashboardLayout>
    <main className="min-h-screen bg-white px-4 py-8 sm:px-6 sm:py-10">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6"
      >
        <div className="flex items-center gap-2">
  <Link
    to="/dashboard"
    className="flex items-center gap-2 text-mint-dark"
  >
    <HiArrowLeft className="h-6 w-6 lg:hidden" />

    <span className="text-[32px] font-bold">
      Personalización
    </span>
  </Link>
</div>

        <section className="w-full">
          <h2 className="mb-4 text-center font-bold text-text-primary">
            Color del sistema
          </h2>

          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
            <ColorPickerField
              label="Color primario"
              color={primaryColor}
              onChange={setPrimaryColor}
            />

            <ColorPickerField
              label="Color secundario"
              color={secondaryColor}
              onChange={setSecondaryColor}
            />
          </div>
        </section>

        <label className="flex w-full max-w-2xl flex-col items-center gap-2">
          <span className="font-bold text-text-primary">
            Tipografía
          </span>

          <select
            value={fontFamily}
            onChange={(event) =>
              setFontFamily(
                event.target.value as RestaurantFont,
              )
            }
            className="w-full rounded-lg border border-border px-4 py-3 outline-none focus:border-mint-dark"
          >
            {AVAILABLE_FONTS.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </label>

        <section className="flex w-full flex-col items-center gap-3">
          <h2 className="font-bold text-text-primary">
            Logo del restaurante
          </h2>

          <label
            htmlFor="restaurant-logo"
            className="flex h-40 w-40 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-neutral-300 bg-white transition hover:opacity-80 sm:h-50 sm:w-50"
          >
            <img
              src={logoPreview}
              alt="Vista previa del logo"
              className="h-full w-80 object-contain p-2 sm:w-full"
            />

            <input
              id="restaurant-logo"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={handleLogoChange}
            />
          </label>

          {!logoFile && !theme.logoUrl && (
            <FiCamera
              aria-hidden="true"
              className="-mt-28 h-12 w-12 text-mint-dark"
            />
          )}
        </section>

        {error && (
          <p className="text-center text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex min-h-6 items-center justify-center">
          {message && (
            <p className="mt-2 text-center text-sm text-mint-darker">
              {message}
            </p>
          )}
        </div>

        <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <button
            type="button"
            onClick={restoreDefaults}
            className="w-full rounded-lg border border-mint-dark px-4 py-3 text-mint-dark sm:w-auto sm:min-w-48"
          >
            Restaurar valores originales
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-lg bg-mint-dark px-4 py-3 text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-48"
          >
            {isSaving
              ? "Guardando..."
              : "Guardar cambios"}
          </button>
        </div>
      </form>
    </main>
    </DashboardLayout>
  );
}

export default ThemeCustomizer;