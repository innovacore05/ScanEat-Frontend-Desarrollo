

type ApiError={


message?:string;
[key:string]:unknown;
};

const MENU_BASE_URL=`${import.meta.env.VITE_API_URL}/api/menu`;

export type Product={

productId:number;
productName:string;
description:string|null;
price:number;
image:string|null;
rating:number;
categoryId:number;
};

//obtener lista de productos , filtrado por categoria y busqueda

export const getProducts=async(params?:{
    category?:number|string;
    search?:string;
})=>{
    const query=new URLSearchParams();

if(params?.category){
    query.append("category",String(params.category));
}
if (params?.search){
    query.append("search",params.search);
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

return data as Product[];

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
    return data as Product;
}

