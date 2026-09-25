
import { cookieSessionClient } from "./cookieSessionClient";

// const BUSINESS_BASE_URL = `${import.meta.env.VITE_API_URL}/api/businesses`;
const BUSINESS_BASE_URL = "/api/businesses";

export const createBusiness = async (
    name: string,
    email: string,
    number: string,
    code: string,
) => {
    // const token = localStorage.getItem("authToken");

    // const response = await fetch(BUSINESS_BASE_URL, {
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application/json",
    //         ...(token ? { Authorization: `Bearer ${token}` } : {}),
    //     },
    //     body: JSON.stringify({
    //         name,
    //         email,
    //         number,
    //         code,
    //     }),
    // });

    // const data = await response.json().catch(() => ({}));

    // if (!response.ok) {
    //     throw data as ApiError;
    // }

    // return data as {
    //     message: string;
    //     business: {
    //         business_id: number;
    //         name: string;
    //         email: string;
    //         number: string;
    //         code: string;
    //         admin_id: number;
    //     };
    // };


return cookieSessionClient.request<{
        message: string;
        business: {
            business_id: number;
            name: string;
            email: string;
            number: string;
            code: string;
            admin_id: number;
        };
}>(BUSINESS_BASE_URL,{
    method:"POST",
    body:JSON.stringify({
        name,
        email,
        number,
        code,
    }),
   fallBackMessage: "No se pudo crear el negocio",
});


};