import { Link} from "@tanstack/react-router";
import { editProfile,getProfile } from "../../services/authService";
import { useEffect, useState } from "react";
import { FaRegCheckCircle } from "react-icons/fa";

import DashboardLayout from "../../components/layout/DashboardLayout";



function ProfileSettingsForm() {
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [originalFirstName, setOriginalFirstName] = useState("");
	const [originalLastName, setOriginalLastName] = useState("");
	const [originalEmail, setOriginalEmail] = useState("");

useEffect(() => {
  const loadProfile = async () => {
    try {
      const data = await getProfile();

      setFirstName(data.user.firstName);
      setLastName(data.user.lastName);
      setEmail(data.user.email);
	  setOriginalFirstName(data.user.firstName);
setOriginalLastName(data.user.lastName);
setOriginalEmail(data.user.email);

    } catch (error) {
      console.error("Error loading profile:", error);
      setError("No se pudo cargar la información del perfil.");
    }
  };

  loadProfile();
}, []);

	async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		setIsSubmitting(true);

		 try {
    const changes: {
        first_name?: string;
        last_name?: string;
        email?: string;
    } = {};

    if (firstName !== originalFirstName) {
        changes.first_name = firstName;
    }

    if (lastName !== originalLastName) {
        changes.last_name = lastName;
    }

    if (email !== originalEmail) {
        changes.email = email;
    }

    if (Object.keys(changes).length === 0) {
        setError("No has realizado ningún cambio.");
        return;
    }

    await editProfile(changes);

    setShowSuccess(true);
  } catch (error) {
    console.error("Error updating profile:", error);
    setError("No se pudo actualizar el perfil. Inténtalo de nuevo.");
  } finally {
    setIsSubmitting(false);
  }
}

	return (
		 <>
		<DashboardLayout>
		<main className="min-h-screen bg-brand-white mt-22">

			<section className="-mt-10 min-h-[calc(100vh-5rem)] rounded-t-[40px] bg-white px-6 py-10">
				<form
					onSubmit={handleSubmit}
					className="mx-auto flex w-full max-w-sm flex-col"
				> 
					<h1 className="text-center text-[32px] font-bold text-mint-dark">
						Profile Settings
					</h1>


					<div className="mt-10">
						<input
							id="firstName"
							name="firstName"
							type="text"
						value={firstName}
						onChange={(e)=>setFirstName(e.target.value)}
							placeholder="Nombre"
							className="mt-2 w-full rounded-lg border border-border px-4 py-3 text-text-primary outline-none focus:border-2 focus:border-brown"
						/>
					</div>

					<div className="mt-5">
						<input
							id="lastName"
							name="lastName"
							type="text"
							value={lastName}
							onChange={(e)=>setLastName(e.target.value)}
							
							placeholder="Apellido"
							className="mt-2 w-full rounded-lg border border-border px-4 py-3 text-text-primary outline-none focus:border-2 focus:border-brown"
						/>
					</div>

					<div className="mt-5">
						<input
							id="email"
							name="email"
							type="email"
							value={email}
							onChange={(e)=>setEmail(e.target.value)}
							
							placeholder="Correo electrónico"
							className="mt-2 w-full rounded-lg border border-border px-4 py-3 text-text-primary outline-none focus:border-2 focus:border-brown"
						/>
                    </div>
                    
                    <div className="mt-5">
						<Link
							to="/changePassword"
							className="mt-2 block w-full cursor-pointer rounded-lg border border-mint-dark px-4 py-3 text-center text-base font-bold text-mint-dark hover:bg-mint-dark/10"
						>
							Cambiar contraseña
						</Link>
					</div>

					<div>
						{error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}

						<Link
							to="/dashboard"
							className="mt-16 block w-full cursor-pointer rounded-lg border border-mint-dark px-4 py-3 text-center text-base font-bold text-mint-dark hover:bg-mint-dark/10"
						>
							Cancelar cambios
						</Link>

						<button
							type="submit"
							disabled={isSubmitting}
							className="mt-6 w-full cursor-pointer rounded-lg bg-mint-dark px-4 py-3 text-base font-bold text-white hover:bg-mint-darker"
						>
							{isSubmitting ? "Guardando..." : "Guardar cambios"}
						</button>
					</div>
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
							Tus datos han sido actualizados correctamente.
						</p>
						<button
						type="button"
						onClick={() => setShowSuccess(false)}
							className="mt-8 cursor-pointer font-bold text-mint-dark hover:underline"
						>
							Aceptar
						</button>
						\</div>
				</div>
			) : null}
		</>
	);
}

export default ProfileSettingsForm;