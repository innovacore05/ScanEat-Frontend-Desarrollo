import { FaRegCheckCircle } from "react-icons/fa";
import { Link } from "@tanstack/react-router";

function PasswordSuccessForm() {
	return (
		<main className="min-h-screen bg-mint flex items-center justify-center px-6">
			<section className="w-full max-w-sm rounded-[40px] bg-white px-8 py-22">
				<div className="flex flex-col items-center text-center">

					<FaRegCheckCircle className="h-20 w-20 text-mint" />

					<h1 className="mt-8 text-2xl font-bold text-mint-dark">
						¡Éxito!
					</h1>

					<p className="mt-4 text-text-primary">
						Tu contraseña se ha restablecido correctamente.
					</p>

					<Link
						to="/login"
						className="mt-8 cursor-pointer text-mint-dark hover:underline font-bold"
					>
						Iniciar sesión
					</Link>
				</div>
			</section>
		</main>
	);
}

export default PasswordSuccessForm;