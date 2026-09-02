import { useEffect, useState } from "react";
import DashboardLayoutCook from "../layout/DashboardLayoutCook";
import { getProfile } from "../../services/authService";

function DashboardCook() {
	const [firstName, setFirstName] = useState("");

	useEffect(() => {
		const loadProfile = async () => {
			try {
				const data = await getProfile();
				setFirstName(data.user.firstName);
			} catch (error) {
				console.error("Error loading profile:", error);
			}
		};

		loadProfile();
	}, []);

	return (
		<DashboardLayoutCook>
			<main className="min-h-screen bg-brand-white">

				{/* Tablet */}
				<section className="lg:hidden px-90 py-15">
					<div>
						<h1 className="text-3xl font-bold text-mint-dark">
							¡Hola, {firstName || "Usuario"}!
						</h1>
					</div>
				</section>

				{/* Computadora */}
				<section className="hidden lg:block px-15 py-15">
					<div className="rounded-2xl bg-mint-dark px-8 py-6">
						<h1 className="text-3xl font-bold text-white">
							¡Hola, {firstName || "Usuario"}!
						</h1>
					</div>
				</section>

			</main>
		</DashboardLayoutCook>
	);
}

export default DashboardCook;