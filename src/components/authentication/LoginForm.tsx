import { useState } from "react";
import { ImEye, ImEyeBlocked } from "react-icons/im";
import { Link, useNavigate } from "@tanstack/react-router";
import { login as loginUser } from "../../services/authService";

function LoginForm() {
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		
		if (!email.trim() || !password) {
            setError("Ingresa tu correo y contraseña.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await loginUser(email.trim(), password);

			if (response.requiresTwoFactor) {
				localStorage.setItem("verificationFlow", "login");
				localStorage.setItem("pendingLoginEmail", email.trim().toLowerCase());
				navigate({ to: "/verificationCode" });
				return;
			}

            if (response.token) {
                localStorage.setItem("authToken", response.token);
            }

            if (response.user) {
                localStorage.setItem("authUser", JSON.stringify(response.user));
            }

            navigate({ to: "/verificationCode" });
        } catch (err) {
            const message =
                err &&
                typeof err === "object" &&
                "message" in err
                    ? String((err as { message?: string }).message)
                    : "No se pudo iniciar sesión.";

            setError(message);
        } finally {
            setIsSubmitting(false);
        }
	}

	return (
		<main className="min-h-screen bg-white">
			<div className="h-48 bg-brand-mint" />

			<section className="-mt-10 min-h-[calc(100vh-11rem)] rounded-t-[40px] bg-white px-6 py-10">
				<form
					onSubmit={handleSubmit}
					className="mx-auto flex w-full max-w-sm flex-col gap-5"
				>
					<h1 className="text-center font-bold text-mint-dark">
						¡Bienvenido de nuevo!
					</h1>

					<input
						id="email"
						type="email"
						placeholder="Correo electrónico"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						className="w-full font-normal text-black text-base rounded-lg border border-border px-4 py-3 focus:border-2 focus:border-brown focus:outline-none"
					/>

					<div className="flex flex-col gap-1">
						<div className="relative">
							<input
								id="password"
								type={showPassword ? "text" : "password"}
								placeholder="Contraseña"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								className="w-full font-normal text-black text-base rounded-lg border border-border px-4 py-3 pr-12 focus:border-2 focus:border-brown focus:outline-none"
							/>

							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-mint-dark"
								aria-label={
									showPassword
										? "Ocultar contraseña"
										: "Mostrar contraseña"
								}
							>
								{showPassword ? <ImEye /> : <ImEyeBlocked />}
							</button>
						</div>

						<Link
							to="/forgotPassword"
							className="mb-2 cursor-pointer self-end text-sm text-text-primary hover:underline"
						>
							¿Olvidaste tu contraseña?
						</Link>
					</div>

					{error ? (
						<p className="text-sm text-red-600">{error}</p>
					) : null}

					<button
						type="submit"
						disabled={isSubmitting}
						className="w-full cursor-pointer rounded-lg bg-mint-dark px-4 py-3 text-white hover:bg-mint-dark/90 disabled:cursor-not-allowed disabled:opacity-70"
					>
						{isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
					</button>
					

					<h3 className="text-center text-text-primary">
						¿No tienes una cuenta?{" "}
						<Link
							to="/register"
							className="text-mint-dark hover:underline text-base"
						>
							Regístrate aquí
						</Link>
					</h3>
				</form>
			</section>
		</main>
	);
}

export default LoginForm;