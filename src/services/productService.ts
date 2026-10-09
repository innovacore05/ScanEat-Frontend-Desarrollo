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

cabysCode?: string | null;

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

//familias fiscales
export type FiscalType =
  | "dishes"
  | "hot_drinks"
  | "cold_drinks"
  | "alcohol_drinks"
  | "packaged"
 ;

  //para filtro de las opciones de cabys segun la categorai general 
export type Category = {
  categoryId: number;
  name: string;
  icon: string | null;
  fiscalType: FiscalType | null;
};

//respuesta de obtener las opciones de tipo

export type FiscalOption = {
  code: string;
  label: string;
  ivaRate: number;
};

export type CabysSearchResult = {
  code: string;
  label: string;
  ivaRate: number;
};


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

const data =await cookieSessionClient.request<Product>(
        `${MENU_BASE_URL}/products/${id}`,
        {method:"GET",
            fallBackMessage: "No se pudo cargar el producto",
            },
    );
    return normalizeProduct(data);
};


export const isCustomProduct = async (id: number): Promise<boolean> => {

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





// obtener lista de categorias
export const getCategories = async (
    mesaId?: string
): Promise<Category[]> => {
    const url = mesaId
        ? `${MENU_BASE_URL}/categories?mesaId=${encodeURIComponent(mesaId)}`
        : `${MENU_BASE_URL}/categories`;

    return cookieSessionClient.request<Category[]>(
        url,
        {
            method: "GET",
            fallBackMessage: "No se pudieron cargar las categorías",
        },
    );
};


//Crear categoria de menu
export const createCategory = async ({
    name,
    icon,
    fiscalType,
}: {
    name: string;
    icon: string;
    fiscalType: FiscalType;
}) => {
    return cookieSessionClient.request(`${MENU_BASE_URL}/categories`, {
        method: "POST",
        body: JSON.stringify({
            name,
            icon,
            fiscalType
        }),
        headers: {
            "Content-Type": "application/json",
        },
        fallBackMessage: "No se pudo crear la categoría",
    });
};

//Eliminar categoria de menu
export const deleteCategory = async (categoryId: number) => {
    return cookieSessionClient.request(
        `${MENU_BASE_URL}/categories/${categoryId}`,
        {
            method: "DELETE",
            fallBackMessage: "No se pudo eliminar la categoría",
        },
    );
};

//Editar categoria de menu
export const updateCategory = async ({
    categoryId,
    name,
    icon,
    fiscalType,
}: {
    categoryId: number;
    name: string;
    icon: string;
    fiscalType:FiscalType;
}) => {
    return cookieSessionClient.request(
        `${MENU_BASE_URL}/categories/${categoryId}`,
        {
            method: "PUT",
            body: JSON.stringify({
                name,
                icon,
                fiscalType
            }),
            headers: {
                "Content-Type": "application/json",
            },
            fallBackMessage: "No se pudo actualizar la categoría",
        },
    );
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
    cabysCode,
}: {
    name: string;
    description: string;
    price: string;
    discount: number | "";
    categoryId: number;
    image: File | null;
    cabysCode:string;
}) => {
  
const formData=new FormData();
formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("categoryId", String(categoryId));

if (cabysCode.trim()) {
  formData.append("cabysCode", cabysCode.trim());
}


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
        cabysCode,
    }: {
        name: string;
        description: string;
        price: string;
        discount: number | "";
        categoryId: number;
        image: File | null;
        cabysCode: string;
    },
) => {

// const token = localStorage.getItem("authToken"); 

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("categoryId", String(categoryId));

if(cabysCode.trim()){
    formData.append("cabysCode",cabysCode.trim());
}

    if (discount !== "") {
        formData.append("discount", String(discount));
    }

    if (image) {
        formData.append("image", image);
    }

    
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
    cabysCode,
    optionGroups,
}: {
    name: string;
    description: string;
    price: string;
    discount: number | "";
    categoryId: number;
    image: File | null;
    cabysCode:string;
    optionGroups: { id: string; name: string; options: string[] }[];
}) => {
    // const token = localStorage.getItem("authToken");

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("categoryId", String(categoryId));

if(cabysCode.trim()){
    formData.append("cabysCode", cabysCode.trim());
}


    if (discount !== "") {
        formData.append("discount", String(discount));
    }

    if (image) {
        formData.append("image", image);
    }

    formData.append("optionGroups", JSON.stringify(optionGroups));


    // return data;

     return cookieSessionClient.request(`${MENU_BASE_URL}/products/custom`, {
     method:"POST",
     body:formData,
     fallBackMessage: "No se pudo crear el platillo personalizado",
    });
};


export const deleteProduct = async (id: number) => {
   
        
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
        cabysCode,
        optionGroups,
    }: {
        name: string;
        description: string;
        price: string;
        discount: number | "";
        categoryId: number;
        image: File | null;
        cabysCode:string;
        optionGroups: { id: string; name: string; options: string[] }[];
    },
) => {
    // const token = localStorage.getItem("authToken");

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("categoryId", String(categoryId));

if(cabysCode.trim()){
formData.append("cabysCode", cabysCode.trim());
}

    if (discount !== "") {
        formData.append("discount", String(discount));
    }

    if (image) {
        formData.append("image", image);
    }

    formData.append("optionGroups", JSON.stringify(optionGroups));

   

    // return data;
     return cookieSessionClient.request(`${MENU_BASE_URL}/products/custom/${id}`, {
        method: "PUT",
        body: formData,
        fallBackMessage: "No se pudo actualizar el platillo personalizado",
    });
};

//nuevo: obtener opciones de cabys de la familia elegida

export const getFiscalOptions = (type: FiscalType) => {
  const params = new URLSearchParams({ type });

  return cookieSessionClient.request<FiscalOption[]>(
    `${MENU_BASE_URL}/fiscal-options?${params.toString()}`,
    {
      method: "GET",
      fallBackMessage: "No se pudieron cargar las opciones CABYS",
    },
  );
};

//buscar cabys por descripcion o codigo por medio del back
export const searchCabys = (query: string, type: FiscalType) => {
  const params = new URLSearchParams({ q: query, type });

  return cookieSessionClient.request<CabysSearchResult[]>(
    `${MENU_BASE_URL}/cabys/search?${params.toString()}`,
    {
      method: "GET",
      fallBackMessage: "No se pudieron buscar opciones CABYS",
    },
  );
};