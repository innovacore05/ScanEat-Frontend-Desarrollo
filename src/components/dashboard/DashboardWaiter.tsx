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
            <main className="min-h-screen bg-brand-white px-4 py-5 sm:px-6 sm:py-8 lg:px-15 lg:py-15">

					<div className="rounded-2xl bg-mint-darker px-5 py-5 sm:px-8 sm:py-6">
						<h1 className="text-3xl font-bold text-white sm:text-3xl">
							¡Hola, {firstName || "Usuario"}!
						</h1>
					</div>
                    <div className="mt-5 grid grid-cols-1 items-start gap-5 xl:grid-cols-2 xl:gap-6">
                        <div className="min-w-0 space-y-5">
                        <DataSummary />
                        
                        <PendingTables />
                        
                        <FavoritesToday />
                        
                        </div>

                        <div className="min-w-0">
                            <DiscountsToday />
                        </div>
                    </div>

			</main>
        </DashboardLayoutWaiter>
    );
}

export default DashboardWaiter;