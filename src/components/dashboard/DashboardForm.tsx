import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import { getProfile } from "../../services/authService";

function DashboardForm() {
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
		<DashboardLayout>
			<section className="px-8 py-8 lg:px-15 lg:py-15">
				<div className="rounded-2xl bg-mint-dark px-8 py-6">
						<h1 className="text-3xl font-bold text-white">
							¡Hola, {firstName || "Usuario"}!
						</h1>
					</div>
			</section>
		</DashboardLayout>
	);
}

export default DashboardForm;