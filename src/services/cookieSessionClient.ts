//Esta clase tiene el objetivo de centralizar las llamadas de autenticacion 
//Se encarga de enviar la galleta para que el forntend no guarde ni lea el token
// Todos  los services deben usarlo en vez del fetch directo


/* 

credentials:include
le dice al navegador que mande las galletas por este request 

siFormData + Content-type
evita que se rompa el limite que le navegador necesita generar

el content type se pone default y los services no mandan el json repetidamente

options.header??
evita que se sobreesciba los valores del header

ESTA CLASE DEBE USARSE EN LOS DEMAS SERVICIOS, ESTA CLASE NO MANEJA LAS GALLETAS
, LAS RECIBE Y LAS DIRECCIONA DONDE DEBEN: LAS GUARDA POR HTTPONLY, LOS ADJUNTA
EN CADA REQUEST 

PERMITE L AENTRADA DEL TOKEN, ES UNA ATORIZACION
Esta clase NO crea ni administra directamente las cookies
El navegador recibe la cookie HttpOnly desde el backend
y posteriormente la envía automáticamente gracias a
credentials: "include"
*/


type ApiError={
    message?:string;
    status?:string
    [key:string]:unknown;
};

class CookieSessionClient{

    async request <T> (url:string,options:RequestInit={}): Promise<T> {
        const isFormData=options.body instanceof FormData;
        const response =await fetch (url,{
            ...options,
            credentials:"include",
            headers:{
           ...(isFormData? {} :{"Content-Type":"application/json"}),
           ...(options.headers??{}),
                },
        });
        const data = await response.json().catch(()=>({}));
if(!response.ok){
    throw {
        ...data,
        status:response.status,
    } as ApiError;
}

return data as T;
    }
}

export const cookieSessionClient =new CookieSessionClient();
export type {ApiError};
