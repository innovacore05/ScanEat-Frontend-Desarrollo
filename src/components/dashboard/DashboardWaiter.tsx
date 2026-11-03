import { useEffect, useState } from "react";
import DashboardLayoutWaiter from "../layout/DashboardLayoutWaiter";
import { getProfile, getStoredFirstName } from "../../services/authService";
import DataSummary from "./DataSummary";
import PendingTables from "./PendingTables";
import FavoritesToday from "./FavoritesToday";
import DiscountsToday from "./DiscountsToday";
import { motion } from "motion/react";

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
               <motion.main
            className="min-h-screen bg-brand-white px-4 py-5 sm:px-6 sm:py-8 lg:px-15 lg:py-15"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            {/* Saludo */}
            <motion.div
                className="rounded-2xl bg-mint-darker px-5 py-5 sm:px-8 sm:py-6"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                        <h1 className="text-3xl font-bold text-white sm:text-3xl">
							¡Hola, {firstName || "Usuario"}!
						</h1>
                        </motion.div>

					
                    <div className="mt-5 grid grid-cols-1 items-start gap-5 xl:grid-cols-2 xl:gap-6">
                        <div className="min-w-0 space-y-5">
                        
<motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.15 }}
                    >
                        <DataSummary />
                    </motion.div>

                        
                       
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.25 }}
                    >
                        <PendingTables />
                    </motion.div>
                        
                         <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.35 }}
                    >
                        <FavoritesToday />
                    </motion.div>
                        
                        </div>



                       <motion.div
                    className="min-w-0"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.25 }}
                >
                    <DiscountsToday />
                </motion.div>

                    </div>

			 </motion.main>
        </DashboardLayoutWaiter>
    );
}

export default DashboardWaiter;