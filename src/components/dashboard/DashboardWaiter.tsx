import { useEffect, useState } from "react";
import DashboardLayoutWaiter from "../layout/DashboardLayoutWaiter";
import { getProfile, getStoredFirstName } from "../../services/authService";
import DataSummary from "./DataSummary";
import PendingTables from "./PendingTables";
import FavoritesToday from "./FavoritesToday";
import DiscountsToday from "./DiscountsToday";

function DashboardWaiter() {
    const [firstName, setFirstName] = useState(getStoredFirstName);

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
        <DashboardLayoutWaiter>
            <main className="min-h-screen bg-brand-white">

				{/* Computadora */}
				<section className="hidden lg:block px-15 py-15">
					<div className="rounded-2xl bg-mint-dark px-8 py-6">
						<h1 className="text-3xl font-bold text-white">
							¡Hola, {firstName || "Usuario"}!
						</h1>
					</div>
                    <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2 xl:gap-6 mt-6">
                        <div>
                        <DataSummary />
                        <PendingTables />
                        <FavoritesToday />
                        </div>

                        <div>
                            <DiscountsToday />
                        </div>
                    </div>
				</section>

			</main>
        </DashboardLayoutWaiter>
    );
}

export default DashboardWaiter;