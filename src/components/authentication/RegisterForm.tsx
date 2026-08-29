import { useState } from "react";
import { ImEye, ImEyeBlocked } from "react-icons/im";
import { Link,useNavigate } from "@tanstack/react-router";
import { register as registerUser } from "../../services/authService";

function RegisterForm() {
    const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [roleId, setRoleId] = useState<number | "">("");
	const [authorizationCode, setAuthorizationCode] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");

		if (
			!firstName.trim() ||
			!lastName.trim() ||
			!email.trim() ||
			!password ||
			!roleId ||
			!authorizationCode.trim()
		) {
			setError(
				"Completa todos los campos requeridos, incluido el tipo de empleado.",
			);
			return;
		}
		if (password.length < 8) {
    setError("La contraseña debe tener al menos 8 caracteres.");
    return;
}

if (!/\d/.test(password)) {
    setError("La contraseña debe contener al menos un número.");
    return;
}

if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]'/+=;`~]/.test(password)) {
    setError("La contraseña debe contener al menos un símbolo.");
    return;
}

if (password !== confirmPassword) {
    setError("Las contraseñas no coinciden.");
    return;
}

		setIsSubmitting(true);

		try {
			await registerUser(
				firstName.trim(),
				lastName.trim(),
				email.trim(),
				password,
				authorizationCode.trim(),
				roleId,
            );

            localStorage.setItem("pendingVerificationEmail", email.trim().toLowerCase());
            navigate({ to: "/accountVerification" });
		} catch (err) {
			const message =
				err &&
				typeof err === "object" &&
				"message" in err
					? String((err as { message?: string }).message)
					: "No se pudo completar el registro.";

			setError(message);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<main className="min-h-screen bg-white">
			<section className=" min-h-[calc(100vh-11rem)] rounded-t-[40px] bg-white px-6 py-10">
				<form
	onSubmit={handleSubmit}
	className="mx-auto flex w-full max-w-sm flex-col gap-5"
> 
	<h1 className="text-center font-bold text-brand-mint-dark">
		Crear cuenta
	</h1>

	<input
		id="firstName"
		type="text"
		placeholder="Nombre"
		value={firstName}
		onChange={(event) =>
			setFirstName(event.target.value)
		}
		className="w-full rounded-lg border border-border px-4 py-3 focus:border-2 focus:border-brand-brown focus:outline-none"
	/>

	<input
		id="lastName"
		type="text"
		placeholder="Apellido"
		value={lastName}
		onChange={(event) =>
			setLastName(event.target.value)
		}
		className="w-full rounded-lg border border-border px-4 py-3 focus:border-2 focus:border-brand-brown focus:outline-none"
	/>

	<input
		id="email"
		type="email"
		placeholder="Correo electrónico"
		value={email}
		onChange={(event) =>
			setEmail(event.target.value)
		}
		className="w-full rounded-lg border border-border px-4 py-3 focus:border-2 focus:border-brand-brown focus:outline-none"
	/>

	<div className="relative">
		<input
			id="password"
			type={showPassword ? "text" : "password"}
			placeholder="Contraseña"
			value={password}
			onChange={(event) => {
				setPassword(event.target.value);
				setError("");
			}}
			className="w-full rounded-lg border border-border px-4 py-3 pr-12 focus:border-2 focus:border-brand-brown focus:outline-none"
		/>

		<button
			type="button"
			onClick={() =>
				setShowPassword(!showPassword)
			}
			className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-brand-mint-dark"
			aria-label={
				showPassword
					? "Ocultar contraseña"
					: "Mostrar contraseña"
			}
		>
			{showPassword ? (
				<ImEye />
			) : (
				<ImEyeBlocked />
			)}
		</button>
	</div>

	<div className="relative">
		<input
			id="confirmPassword"
			type={
				showConfirmPassword
					? "text"
					: "password"
			}
			placeholder="Confirmar contraseña"
			value={confirmPassword}
			onChange={(event) => {
				setConfirmPassword(event.target.value);
				setError("");
			}}
			className="w-full rounded-lg border border-border px-4 py-3 pr-12 focus:border-2 focus:border-brand-brown focus:outline-none"
		/>

		<button
			type="button"
			onClick={() =>
				setShowConfirmPassword(
					!showConfirmPassword,
				)
			}
			className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-brand-mint-dark"
			aria-label={
				showConfirmPassword
					? "Ocultar contraseña"
					: "Mostrar contraseña"
			}
		>
			{showConfirmPassword ? (
				<ImEye />
			) : (
				<ImEyeBlocked />
			)}
		</button>
	</div>

	<select
		id="role"
		value={roleId}
		onChange={(event) =>
			setRoleId(Number(event.target.value))
		}
		className="w-full cursor-pointer rounded-lg border border-border bg-white px-4 py-3 text-text-primary focus:border-2 focus:border-brand-brown focus:outline-none"
	>
		<option value="" disabled>
			Tipo de empleado
		</option>
		<option value={1}>Propietario</option>
		<option value={2}>Cocinero</option>
		<option value={3}>Mesero</option>
	</select>

	<input
		id="authorizationCode"
		type="text"
		placeholder="Código de autorización"
		value={authorizationCode}
		onChange={(event) =>
			setAuthorizationCode(event.target.value)
		}
		className="w-full rounded-lg border border-border px-4 py-3 focus:border-2 focus:border-brand-brown focus:outline-none"
	/>

	{error ? (
		<p className="text-sm text-red-600">
			{error}
		</p>
	) : null}

	<button
		type="submit"
		disabled={isSubmitting}
		className="w-full cursor-pointer rounded-lg bg-brand-mint-dark px-4 py-3 text-white hover:bg-brand-mint-dark/90 disabled:cursor-not-allowed disabled:opacity-70"
	>
		{isSubmitting
			? "Enviando código..."
			: "Siguiente"}
	</button>

	<p className="text-center text-text-primary">
		¿Ya tienes una cuenta?{" "}
		<Link
			to="/login"
			className="text-brand-mint-dark hover:underline"
		>
			Inicia sesión
		</Link>
	</p>
</form>
			</section>
		</main>
	);
}

export default RegisterForm;