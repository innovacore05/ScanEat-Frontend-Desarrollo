import { cookieSessionClient, type ApiError} from "./cookieSessionClient";


// const MENU_BASE_URL=`${import.meta.env.VITE_API_URL}/api/menu`;
const MENU_BASE_URL = "/api/menu";

const getImageUrl = (image: string | null) => {
    if (!image) return image;

    return new URL(image, `${import.meta.env.VITE_API_URL}/`).toString();
};

export type Product={
productId:number;
productName:string;
description:string|null;
price:number;
image:string|null;
rating:number;
categoryId:number;
discount?: number | string;
discountPercentage?: number | string;
discount_percent?: number | string;
isCustom?: boolean | number;
productType?: string;
optionGroups?: { id: string; name: string; options: string[] }[];
options?: unknown[];
customizations?: unknown[];
customizationGroups?: unknown[];
isCustomProduct?: boolean | number;
};

export type ProductsPage = {
	products: Product[];
	hasMore: boolean;
};

const normalizeProduct = (product: Product): Product => ({
    ...product,
    image: getImageUrl(product.image),
});


//obtener lista de productos , filtrado por categoria y busqueda

export const getProducts=async(params?:{
    category?:number|string;
    search?:string;
    limit?:number;
    offset?:number;
    mesaId?: string;
})=>{
    const query=new URLSearchParams();
    if (params?.mesaId) {
    query.append("mesaId", params.mesaId);
}

if(params?.category){
    query.append("category",String(params.category));
}
if (params?.search){
    query.append("search",params.search);
}
if (params?.limit){
    query.append("limit", String(params.limit));  
}
if (params?.offset) {
    query.append("offset", String(params.offset));
}

const queryString=query.toString();
const url=queryString
? `${MENU_BASE_URL}/products?${queryString}`
:`${MENU_BASE_URL}/products`;

// const token = localStorage.getItem("authToken");

// const response = await fetch(url, {
//   method: "GET",
//   headers: {
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//   },
// });
// const data=await response.json().catch(()=>({}));

// if(!response.ok){
//     throw data as ApiError;
// }

//     const page = data as ProductsPage;

//     return {
//         ...page,
//         products: page.products.map(normalizeProduct),
//     };
const data = await cookieSessionClient.request<ProductsPage>(
    url,{method:"GET",
     fallBackMessage: "No se pudieron cargar los productos",});
return {
    ...data,
    products:data.products.map(normalizeProduct),
};
};



//obtener producto de menu por id

export const getProductById= async (id: number | string)=>{
//     const response =await fetch (`${MENU_BASE_URL}/products/${id}`, {
//         method:"GET",
//     });
//     const data=await response.json().catch(()=>({}));
//     if(!response.ok){
//         throw data as ApiError;
//     }
//     return normalizeProduct(data as Product);
// }
const data =await cookieSessionClient.request<Product>(
        `${MENU_BASE_URL}/products/${id}`,
        {method:"GET",
            fallBackMessage: "No se pudo cargar el producto",
            },
    );
    return normalizeProduct(data);
};


export const isCustomProduct = async (id: number): Promise<boolean> => {
//     const token = localStorage.getItem("authToken");

// const response = await fetch(`${MENU_BASE_URL}/products/${id}`, {
//     method: "GET",
//     headers: {
//         ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     },
// });

//     if (response.ok) {
//         return true;
//     }

//     if (response.status === 404 || response.status === 405) {
//         return false;
//     }

//     const data = await response.json().catch(() => ({}));
//     throw data as ApiError;
// };

// const data =await cookieSessionClient.request<Product>(
//         `${MENU_BASE_URL}/products/${id}`,
//         {method:"GET",
//             fallBackMessage: "No se pudo cargar el producto",
//             },
//     );
//     return normalizeProduct(data);
try{
        await cookieSessionClient.request(
            `${MENU_BASE_URL}/products/custom/${id}`, {
                method:"GET",
                fallBackMessage: "No se pudo verificar el producto",
            },
        );
    return true;
    }catch (error){
        const apiError = error as ApiError;
       
        if(
            apiError.status===404 ||
            apiError.status===405
        ){
            return false;
        }
    throw error;
    }
};

//obtener categorias de menu
export const getCategories = async () => {
    // const token = localStorage.getItem("authToken");

    // const response = await fetch(`${MENU_BASE_URL}/categories`, {
    //     method: "GET",
    //     headers: {
    //         ...(token ? { Authorization: `Bearer ${token}` } : {}),
    //     },
    // });

    // const data = await response.json().catch(() => []);

    // if (!response.ok) {
    //     throw data as ApiError;
    // }

    // return data;

    return cookieSessionClient.request(`${MENU_BASE_URL}/categories`, {
        method : "GET",
    fallBackMessage:"No se pudieron cargar las categorías",
});
};

// Verificar si un producto es personalizado
export const productIsCustom = (product: Product): boolean => {
    const productData = product as Product & Record<string, unknown>;
    const type = String(
        productData.productType ?? productData.type ?? productData.kind ?? "",
    ).toLowerCase();
    const searchableText = `${product.productName} ${product.description ?? ""}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    return Boolean(
        productData.isCustom === true ||
        productData.isCustomProduct === true ||
        productData.optionGroups ||
        productData.options ||
        productData.customizations ||
        productData.customizationGroups ||
        type.includes("custom") ||
        type.includes("personal") ||
        searchableText.includes("personalizado") ||
        searchableText.includes("a escoger") ||
        searchableText.includes("escoger") ||
        searchableText.includes("opciones"),
    );
};


//crear producto simple
export const createProduct = async ({
    name,
    description,
    price,
    discount,
    categoryId,
    image,
}: {
    name: string;
    description: string;
    price: string;
    discount: number | "";
    categoryId: number;
    image: File | null;
}) => {
    //  const token = localStorage.getItem("authToken");
    // const formData = new FormData();

    // formData.append("name", name);
    // formData.append("description", description);
    // formData.append("price", price);
    // formData.append("categoryId", String(categoryId));

    // if (discount !== "") {
    //     formData.append("discount", String(discount));
    // }

    // if (image) {
    //     formData.append("image", image);
    // }

    // const response = await fetch(`${MENU_BASE_URL}/products`, {
    //     method: "POST",
    //     headers: {
    //         ...(token ? { Authorization: `Bearer ${token}` } : {}), // ← ahora sí dentro de headers
    //     },
    //     body: formData,
       
    // });

    // const data = await response.json().catch(() => ({}));

    // if (!response.ok) {
    //     throw data as ApiError;
    // }

    // return data;
    
const formData=new FormData();
formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("categoryId", String(categoryId));

    if (discount !== "") {
        formData.append("discount", String(discount));
    }

    if (image) {
        formData.append("image", image);
    }

return cookieSessionClient.request(`${MENU_BASE_URL}/products`, {
     method:"POST",
     body:formData,
     fallBackMessage: "No se pudo crear el producto",
});
};

export const updateProduct = async (
    id: number,
    {
        name,
        description,
        price,
        discount,
        categoryId,
        image,
    }: {
        name: string;
        description: string;
        price: string;
        discount: number | "";
        categoryId: number;
        image: File | null;
    },
) => {

// const token = localStorage.getItem("authToken"); 

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("categoryId", String(categoryId));

    if (discount !== "") {
        formData.append("discount", String(discount));
    }

    if (image) {
        formData.append("image", image);
    }

    // const response = await fetch(`${MENU_BASE_URL}/products/${id}`, {
    //     method: "PUT",
    //      headers: {
    //         ...(token ? { Authorization: `Bearer ${token}` } : {}), // ← agregar
    //     },
    //     body: formData,
    // });

    // const data = await response.json().catch(() => ({}));

    // if (!response.ok) {
    //     throw data as ApiError;
    // }

    // return data;
     return cookieSessionClient.request(`${MENU_BASE_URL}/products/${id}`, {
     method:"PUT",
     body:formData,
     fallBackMessage: "No se pudo actualizar el producto",
    });
};

//crear producto personalizado 
export const createCustomDish = async ({
    name,
    description,
    price,
    discount,
    categoryId,
    image,
    optionGroups,
}: {
    name: string;
    description: string;
    price: string;
    discount: number | "";
    categoryId: number;
    image: File | null;
    optionGroups: { id: string; name: string; options: string[] }[];
}) => {
    // const token = localStorage.getItem("authToken");

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("categoryId", String(categoryId));

    if (discount !== "") {
        formData.append("discount", String(discount));
    }

    if (image) {
        formData.append("image", image);
    }

    formData.append("optionGroups", JSON.stringify(optionGroups));

    // const response = await fetch(`${MENU_BASE_URL}/products/custom`, {
    //     method: "POST",
    //     headers: {
    //         ...(token ? { Authorization: `Bearer ${token}` } : {}),
    //     },
    //     body: formData,
    // });

    // const data = await response.json().catch(() => ({}));

    // if (!response.ok) {
    //     throw data as ApiError;
    // }

    // return data;

     return cookieSessionClient.request(`${MENU_BASE_URL}/products/custom`, {
     method:"POST",
     body:formData,
     fallBackMessage: "No se pudo crear el platillo personalizado",
    });
};


export const deleteProduct = async (id: number) => {
    //const token = localStorage.getItem("authToken");
    //         const response = await fetch(url, {
    //             method: "DELETE",
    //             headers: {
    //   ...(token ? { Authorization: `Bearer ${token}` } : {}), // ← agregar
    // },
    //         });

    //         if (response.ok) {
    //             return true;
    //         }

    //         const data = await response.json().catch(() => ({}));

    //         if (response.status === 404 || response.status === 405) {
    //             lastError = data as ApiError;
    //             continue;
    //         }

    //         throw data as ApiError;
    //     } catch (error) {
    //         lastError = error as ApiError;
    //     }
    // }

    // throw lastError as ApiError;
             //return true;
        
    return cookieSessionClient.request(
        `${MENU_BASE_URL}/products/${id}`,
        {
            method: "DELETE",
            fallBackMessage: "No se pudo eliminar el platillo",
        },
    );
};



export const updateCustomDish = async (
    id: number,
    {
        name,
        description,
        price,
        discount,
        categoryId,
        image,
        optionGroups,
    }: {
        name: string;
        description: string;
        price: string;
        discount: number | "";
        categoryId: number;
        image: File | null;
        optionGroups: { id: string; name: string; options: string[] }[];
    },
) => {
    // const token = localStorage.getItem("authToken");

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("categoryId", String(categoryId));

    if (discount !== "") {
        formData.append("discount", String(discount));
    }

    if (image) {
        formData.append("image", image);
    }

    formData.append("optionGroups", JSON.stringify(optionGroups));

    // const response = await fetch(`${MENU_BASE_URL}/products/custom/${id}`, {
    //     method: "PUT",
    //     headers: {
    //         ...(token ? { Authorization: `Bearer ${token}` } : {}),
    //     },
    //     body: formData,
    // });

    // const data = await response.json().catch(() => ({}));

    // if (!response.ok) {
    //     throw data as ApiError;
    // }

    // return data;
     return cookieSessionClient.request(`${MENU_BASE_URL}/products/custom/${id}`, {
        method: "PUT",
        body: formData,
        fallBackMessage: "No se pudo actualizar el platillo personalizado",
    });
};