import { AiOutlineExclamationCircle } from "react-icons/ai";
import { BsFillArrowLeftCircleFill } from "react-icons/bs";
import { Link } from "@tanstack/react-router";

function ChangePasswordError() {
    return (
        <main className="min-h-screen bg-mint flex items-center justify-center px-6">
            <section className="w-full max-w-sm rounded-[40px] bg-white px-8 py-22">
                <div className="flex flex-col items-center text-center">
                    
                    <AiOutlineExclamationCircle className="h-20 w-20 text-pink" />

                    <h1 className="mt-8 text-2xl font-bold text-pink">
                        Problema inesperado
                    </h1>

                    <p className="mt-4 text-text-primary">
                        No se pudo cambiar la contraseña. Por favor, intenta nuevamente.
                    </p>

                    <Link
                        to="/changePassword"
                        className="mt-8 cursor-pointer text-mint"
                        aria-label="Volver al inicio de sesión"
                    >
                        <BsFillArrowLeftCircleFill className="h-10 w-10" />
                    </Link>
                </div>
            </section>
        </main>
    );
}

export default ChangePasswordError;