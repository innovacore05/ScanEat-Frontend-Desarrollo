
{/* Cambio:ninguno no se toco*/}


type ApiError={


message?:string;
[key:string]:unknown;
};

const MENU_BASE_URL=`${import.meta.env.VITE_API_URL}/api/menu`;

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
})=>{
    const query=new URLSearchParams();

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

const response =await fetch(url,{
    method:"GET",
});

const data=await response.json().catch(()=>({}));

if(!response.ok){
    throw data as ApiError;
}

    const page = data as ProductsPage;

    return {
        ...page,
        products: page.products.map(normalizeProduct),
    };

};



//obtener producto de menu por id

export const getProductById= async (id: number | string)=>{
    const response =await fetch (`${MENU_BASE_URL}/products/${id}`, {
        method:"GET",
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok){
        throw data as ApiError;
    }
    return normalizeProduct(data as Product);
}


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
    const formData = new FormData();

    formData.append("productName", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("categoryId", String(categoryId));

    if (discount !== "") {
        formData.append("discount", String(discount));
    }

    if (image) {
        formData.append("image", image);
    }

    const response = await fetch(`${MENU_BASE_URL}/products`, {
        method: "POST",
        body: formData,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw data as ApiError;
    }

    return data;
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
    const token = localStorage.getItem("authToken");

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

    const response = await fetch(`${MENU_BASE_URL}/products/custom`, {
        method: "POST",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw data as ApiError;
    }

    return data;
};