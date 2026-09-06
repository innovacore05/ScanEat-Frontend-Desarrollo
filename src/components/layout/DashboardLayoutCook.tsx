import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getProfile, logout } from "../../services/authService";
import { FaRegCircleUser } from "react-icons/fa6";
import { RiNotification2Line } from "react-icons/ri";
import { LuLogOut } from "react-icons/lu";
import { GoHome } from "react-icons/go";
import { LuShoppingBag } from "react-icons/lu";

interface DashboardLayoutCookProps {
	children: React.ReactNode;
}

function DashboardLayoutCook({ children }: DashboardLayoutCookProps) {
      // const [isMenuOpen, setIsMenuOpen] = useState(false);

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");

	useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();

        setFirstName(data.user.firstName);
        setLastName(data.user.lastName);
        setEmail(data.user.email);
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    loadProfile();
  }, []);

	return (
		<div className="min-h-screen bg-brand-white">
			{/*  COMPUTADORA */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 bg-neutral-50  px-8 py-8 lg:flex lg:flex-col rounded-r-4xl">
    

        <nav className="mt-10 flex flex-col">
          <Link
            to="/dashboardCook"
            className="flex items-center gap-4 py-3 text-left text-text-primary"
          >
            <GoHome className="h-6 w-6 shrink-0" />

            <span className="text-[15px] font-bold cursor-pointer">Inicio</span>
          </Link>



          <button
            type="button"
            className="flex items-center gap-4 py-3 text-left text-text-primary"
          >
            <LuShoppingBag className="h-6 w-6 shrink-0" />

            <span className="text-[15px] font-bold cursor-pointer">
              Pedidos
            </span>
          </button>

        </nav>

        <div className="mt-10 border-t border-neutral-300 pt-5">
        

          <button
            type="button"
            className="flex items-center gap-4 py-3 text-left text-text-primary"
          >
            <RiNotification2Line className="h-6 w-6 shrink-0" />

            <span className="text-[15px] font-bold cursor-pointer">
              Notificaciones
            </span>
          </button>

          {/* //cerrar sesion normal , regresa al registro inicio de sesion/ */}
          <Link
            to="/login"
            onClick={logout}
            className="flex items-center gap-4 py-3 pb-8 text-left text-text-primary border-b border-neutral-300"
          >
            <LuLogOut className="h-6 w-6 shrink-0" />

            <span className="text-[15px] font-bold cursor-pointer ">
              Cerrar sesión
            </span>
          </Link>


        </div>

        <div className="mt-10  pt-5">
          <div className="flex items-center gap-3">
            <FaRegCircleUser className="h-9 w-9 shrink-0 text-mint-darker" />

            <div className="min-w-0">
              <p className="truncate font-bold text-mint-darker">
                {firstName || "Usuario"} {lastName}
              </p>

              <p className="truncate text-sm text-mint-darker">
                {email || "correo electrónico"}
              </p>
            </div>
          </div>
        </div>
      </aside>

			{/* TABLET */}
			<div className="hidden md:block lg:hidden">
				<div className="fixed left-0 top-0 z-50 flex h-screen w-72 flex-col rounded-r-[30px] bg-mint-dark px-8 pt-10">
					

					<nav className=" flex mt-40 flex-col justify-center gap-2 ">
						<Link
							to="/dashboardCook"
							className="flex w-full items-center gap-4 py-4 text-left text-white"
						>
							<GoHome className="h-6 w-6 shrink-0" />

							<span className="text-xl font-bold">
								Inicio
							</span>
						</Link>

						<button
							type="button"
							className="flex w-full items-center gap-4 py-4 text-left text-white"
						>
							<LuShoppingBag className="h-6 w-6 shrink-0" />

							<span className="text-xl font-bold">
								Pedidos
							</span>
						</button>

                        <button
							type="button"
							className="flex w-full items-center gap-4 py-4 text-left text-white"
						>
							<RiNotification2Line className="h-6 w-6 shrink-0" />

							<span className="text-xl font-bold">
								Notificaciones
							</span>
                        </button>
                        
                        <Link
                            to="/login"
                            onClick={logout}
                            className="mt-10 flex w-full items-center gap-4 py-4 text-left text-white"
                        >
                            <LuLogOut className="h-6 w-6 shrink-0" />

                            <span className="text-xl font-bold">Cerrar sesión</span>
                        </Link>
                        
					</nav>

	
				</div>
			</div>

			<div className="lg:ml-64">
				{children}
			</div>
		</div>
	);
}

export default DashboardLayoutCook;