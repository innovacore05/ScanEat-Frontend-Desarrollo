import { createContext, useContext, useState, type ReactNode } from "react";

export type CartItem = {
  cartItemId:string;
  productId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedOptions: Record<string, string>;
};

type CartContextType = {
  mesaId: string | undefined;
  setMesaId: (mesaId: string | undefined) => void;
  cartItems: CartItem[];
  addToCart: (
    item: Omit<CartItem,"cartItemId">
  ) => void;
  increaseQuantity: (cartItemId: string) => void;
decreaseQuantity: (cartItemId: string) => void;
removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

//nuevo
function areOptionsEqual(
first:Record<string,string>,
second:Record<string,string>,
){

  const firstKeys=Object.keys(first);
  const secondKeys=Object.keys(second);

  if(firstKeys.length!==secondKeys.length){
    return false;
  }

  return firstKeys.every((key)=>first[key]===second[key]);
}



export function CartProvider({ children }: { children: ReactNode }) {
  const [mesaId, setMesaId] = useState<string | undefined>(undefined);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

//cambios

  const addToCart = (item: Omit<CartItem, "cartItemId">)=> {
    setCartItems((currentItems) => {
    const existingItem = currentItems.find(

      (currentItem)=>
        currentItem.productId === item.productId &&
      areOptionsEqual(
        currentItem.selectedOptions,
        item.selectedOptions,
      ),
    );

if(existingItem){
  return currentItems.map((currentItem)=>
  currentItem.cartItemId === existingItem.cartItemId
  ?{
    ...currentItem,
    quantity: currentItem.quantity + item.quantity,
  }
  :currentItem,
  );
}

return [
  ...currentItems,
  {
    ...item,
    cartItemId:crypto.randomUUID(),
  },
];

    });
  };
    



  const increaseQuantity = (cartItemId: string) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  };

  const decreaseQuantity = (cartItemId: string) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.cartItemId!== cartItemId),
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        mesaId,
        setMesaId,
        cartItems,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }

  return context;
}