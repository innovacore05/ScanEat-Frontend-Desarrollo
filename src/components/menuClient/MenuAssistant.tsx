import { useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from "react";
import {LuLoaderCircle, LuSend, LuX } from "react-icons/lu";
import {
  sendMenuChatMessage,
  type ChatMessage,
  type ChatAction,
} from "../../services/aiService";
import { getProductById, type Product } from "../../services/productService";
import { Bot } from '@/components/animate-ui/icons/bot';

type Role = "meal" | "drink" | "dessert";

type Recommendation = {
  productId: number;
  productName: string;
  price: number;
  reason: string;
  role: Role;
};

type Message = {
  from: "client" | "assistant";
  text: string;
  recommendations?: Recommendation[];
};

type AgentStage =
  | "idle"
  | "awaiting_add_confirmation"
  | "awaiting_option"
  | "awaiting_instruction"
  | "awaiting_final_confirmation";

type CartProduct = {
  productId: number;
  name: string;
  price: number;
  discount: number;
  image: string;
  quantity: number;
  selectedOptions: Record<string, string>;
  specialInstructions?: {
    unit: number;
    instruction: string;
  }[];
};

type Props = {
  mesaId?: string;
  isAddingToOrder: boolean;
  onAddToCart: (product: CartProduct) => void;
  onAddToOrderCart: (product: CartProduct) => void;
};

const roleName: Record<Role, string> = {
  meal: "Comida",
  drink: "Bebida",
  dessert: "Postre",
};

function MenuAssistant({
  mesaId,
  isAddingToOrder,
  onAddToCart,
  onAddToOrderCart,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [loadingRecommendation, setLoadingRecommendation] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [pendingAction, setPendingAction] = useState<Extract<
  ChatAction,
  { type: "confirm_add_to_cart" }
> | null>(null);
  const pendingRecommendedProductsRef = useRef<Recommendation[]>([]);
  const [lastRecommendations, setLastRecommendations] = useState<Recommendation[]>([]);
  const [pendingQuantity, setPendingQuantity] = useState(1);
  const [agentStage, setAgentStage] = useState<AgentStage>("idle");
  const [optionGroupIndex, setOptionGroupIndex] = useState(0);
  const [specialInstruction, setSpecialInstruction] = useState("");
  const [productToCustomize, setProductToCustomize] = useState<Product | null>(null);
  const [options, setOptions] = useState<Record<string, string>>({});
  const [buttonPosition, setButtonPosition] = useState<{ left: number; top: number } | null>(null);
  const [panelPosition, setPanelPosition] = useState<{ left: number; top: number; width: number }>({
    left: 0,
    top: 0,
    width: 352,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragStart = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const wasDragged = useRef(false);

  const placePanel = (buttonLeft: number, buttonTop: number) => {
    const width = Math.min(352, window.innerWidth - 32);
    const height = Math.min(window.innerHeight * 0.75, 576);
    const left = Math.max(16, Math.min(buttonLeft + 56 - width, window.innerWidth - width - 16));
    const top = buttonTop > window.innerHeight / 2
      ? Math.max(16, buttonTop - height - 12)
      : Math.min(buttonTop + 68, window.innerHeight - height - 16);

    setPanelPosition({ left, top, width });
  };

  const startDragging = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      left: bounds.left,
      top: bounds.top,
    };
    wasDragged.current = false;
  };

  const dragButton = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragStart.current) return;

    const left = Math.max(8, Math.min(
      dragStart.current.left + event.clientX - dragStart.current.x,
      window.innerWidth - 64,
    ));
    const top = Math.max(8, Math.min(
      dragStart.current.top + event.clientY - dragStart.current.y,
      window.innerHeight - 64,
    ));

    if (Math.abs(event.clientX - dragStart.current.x) > 3 || Math.abs(event.clientY - dragStart.current.y) > 3) {
      wasDragged.current = true;
    }

    setButtonPosition({ left, top });
    if (isOpen) placePanel(left, top);
  };

  const stopDragging = () => {
    dragStart.current = null;
  };

  const toggleChat = () => {
    if (wasDragged.current) {
      wasDragged.current = false;
      return;
    }

    if (!isOpen && buttonRef.current) {
      const bounds = buttonRef.current.getBoundingClientRect();
      placePanel(bounds.left, bounds.top);
    }
    setIsOpen(!isOpen);
  };

  const startProductConfiguration = async (
    action: Extract<ChatAction, { type: "confirm_add_to_cart" }>,
  ) => {

  setIsSending(true);
  setNotice("");

  try {
    const product = await getProductById(action.productId);

    setPendingQuantity(action.quantity);
    setProductToCustomize(product);
    setOptions({});
    setSpecialInstruction("");
    setPendingAction(null);
    const groups = product.optionGroups ?? [];
    setOptionGroupIndex(0);
    setAgentStage(groups.length > 0 ? "awaiting_option" : "awaiting_instruction");

    setMessages((current) => [
      ...current,
      {
        from: "client",
        text: "Sí",
      },
      {
        from: "assistant",
        text: product.optionGroups?.length
          ? `Perfecto. ¿Qué ${product.optionGroups[0].name.toLowerCase()} deseas para ${product.productName}? Opciones: ${product.optionGroups[0].options.join(", ")}.`
          : `Perfecto. ¿Quieres agregar una indicación especial para ${product.productName}? Escribe "ninguna" si no deseas agregarla.`,
      },
    ]);
  } catch {
    setPendingAction(null);

    setMessages((current) => [
      ...current,
      {
        from: "client",
        text: "Sí",
      },
      {
        from: "assistant",
        text: "No pude cargar ese producto. No se agregó a la orden.",
      },
    ]);
  } finally {
    setIsSending(false);
  }
};

const startPendingProductConfiguration = async () => {
  if (!pendingAction) return;
  await startProductConfiguration(pendingAction);
};

const finishProductConfiguration = (
  instruction: string,
  selectedOptions: Record<string, string> = options,
) => {
  if (!productToCustomize) return;

  setSpecialInstruction(instruction);
  setAgentStage("awaiting_final_confirmation");
  const selectedOptionsText = Object.values(selectedOptions).join(", ");
  const instructionText = instruction || "sin indicaciones especiales";

  setMessages((current) => [
    ...current,
    {
      from: "assistant",
      text: `Confirma: ¿deseas agregar ${pendingQuantity} ${productToCustomize.productName} a la orden${selectedOptionsText ? ` (${selectedOptionsText})` : ""}, ${instructionText}? Responde sí o no.`,
    },
  ]);
};

const handleAgentMessage = (clientMessage: string): boolean => {
  if (!productToCustomize) return false;

  if (agentStage === "awaiting_option") {
    const groups = productToCustomize.optionGroups ?? [];
    const group = groups[optionGroupIndex];
    if (!group) return false;

    const normalizedMessage = clientMessage.trim().toLocaleLowerCase();
    const selectedOption = group.options.find(
      (option) => option.toLocaleLowerCase() === normalizedMessage,
    );

    if (!selectedOption) {
      setMessages((current) => [
        ...current,
        {
          from: "assistant",
          text: `No reconocí esa opción. Para ${group.name}, elige una de estas: ${group.options.join(", ")}.`,
        },
      ]);
      return true;
    }

    const nextOptions = {
      ...options,
      [String(group.id)]: selectedOption,
    };
    setOptions(nextOptions);

    const nextGroup = groups[optionGroupIndex + 1];
    if (nextGroup) {
      setOptionGroupIndex(optionGroupIndex + 1);
      setMessages((current) => [
        ...current,
        {
          from: "assistant",
          text: `¿Qué ${nextGroup.name.toLowerCase()} deseas? Opciones: ${nextGroup.options.join(", ")}.`,
        },
      ]);
    } else {
      setAgentStage("awaiting_instruction");
      setMessages((current) => [
        ...current,
        {
          from: "assistant",
          text: '¿Quieres agregar una indicación especial? Escríbela o responde "ninguna".',
        },
      ]);
    }

    return true;
  }

  if (agentStage === "awaiting_instruction") {
    const instruction =
      /^(ninguna|ninguno|no|sin indicaciones?|no gracias)$/i.test(clientMessage.trim())
        ? ""
        : clientMessage.trim();
    finishProductConfiguration(instruction, options);
    return true;
  }

  if (agentStage === "awaiting_final_confirmation") {
    if (isConfirmation(clientMessage)) {
      putInCart(
        productToCustomize,
        options,
        specialInstruction,
        pendingQuantity,
      );
    } else if (isCancellation(clientMessage)) {
      setProductToCustomize(null);
      setOptions({});
      setSpecialInstruction("");
      setAgentStage("idle");
      setMessages((current) => [
        ...current,
        {
          from: "assistant",
          text: "Está bien, no agregué el producto a la orden.",
        },
      ]);
    } else {
      setMessages((current) => [
        ...current,
        {
          from: "assistant",
          text: "Responde sí para agregarlo o no para cancelar.",
        },
      ]);
    }
    return true;
  }

  return false;
};

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!mesaId || !text.trim() || isSending || loadingRecommendation) return;

    const clientMessage = text.trim();
    setText("");
    setNotice("");
    const history: ChatMessage[] = messages.map((message) => ({
  role: message.from === "client" ? "user" : "assistant",
  content: message.text,
}));

if (pendingAction && isConfirmation(clientMessage)) {
  await startPendingProductConfiguration();
  return;
}

if (
  agentStage === "idle" &&
  pendingAction === null &&
  lastRecommendations.length > 0 &&
  /^(agrega|agregar|agrégalo|agregalo|añade|anade)\s+(eso|esto|lo recomendado|las recomendaciones|todo|los dos|ambos)$/i.test(
    clientMessage,
  ) ||
  /^(quiero|deseo)\s+(agregar|añadir|sumar)\s+(eso|esto|los dos|ambos|lo recomendado|las recomendaciones)$/i.test(
    clientMessage,
  )
) {
  const productsToAdd = lastRecommendations.filter(
    (recommendation) => recommendation.role !== "dessert",
  );
  if (productsToAdd.length > 0) {
    const [first, ...rest] = productsToAdd;
    pendingRecommendedProductsRef.current = rest;
    setPendingAction({
      type: "confirm_add_to_cart",
      productId: first.productId,
      productName: first.productName,
      quantity: 1,
    });
    setMessages((current) => [
      ...current,
      { from: "client", text: clientMessage },
      {
        from: "assistant",
        text: `Entendido. ¿Quieres agregar ${productsToAdd
          .map((product) => product.productName)
          .join(" y ")} a la orden?`,
      },
    ]);
  }
  return;
}

if (pendingAction && isCancellation(clientMessage)) {
  setPendingAction(null);
  pendingRecommendedProductsRef.current = [];
  setNotice("Está bien, no agregué el producto a la orden.");
  setMessages((current) => [
    ...current,
    { from: "client", text: clientMessage },
    {
      from: "assistant",
      text: "Está bien, no agregué el producto. ¿Qué te gustaría pedir?",
    },
  ]);
  setText("");
  return;
}

if (agentStage !== "idle") {
  setMessages((current) => [
    ...current,
    { from: "client", text: clientMessage },
  ]);
  if (handleAgentMessage(clientMessage)) {
    return;
  }
}

if (agentStage !== "idle" && productToCustomize) {
  return;
}

setMessages((current) => [
  ...current,
  { from: "client", text: clientMessage },
]);

setIsSending(true);

try {
  const answer = await sendMenuChatMessage(
    mesaId,
    clientMessage,
    history,
  );
  setLastRecommendations(answer.recommendations);
  if (answer.action.type === "confirm_add_to_cart") {
  setPendingAction(answer.action);
}
      setMessages((current) => [
        ...current,
        {
          from: "assistant",
          text: answer.reply,
          recommendations: answer.recommendations,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          from: "assistant",
          text: "No pude consultar el menú. Puedes elegir un platillo directamente.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const putInCart = (
  product: Product,
  selectedOptions: Record<string, string>,
  instruction = "",
  quantity = 1,
) => {
    const cartProduct: CartProduct = {
      productId: product.productId,
      name: product.productName,
      price: Number(product.price),
      discount: Number(product.discount ?? 0),
      image: product.image ?? "",
      quantity: Number.isInteger(quantity) && quantity > 0 ? quantity : 1,
      selectedOptions,
      specialInstructions: instruction.trim()
  ? [{ unit: 1, instruction: instruction.trim() }]
  : [],
    };

    if (isAddingToOrder) onAddToOrderCart(cartProduct);
    else onAddToCart(cartProduct);

    setNotice(`${product.productName} se agregó al carrito.`);
    setProductToCustomize(null);
    setOptions({});
    setSpecialInstruction("");
    setPendingQuantity(1);
    setOptionGroupIndex(0);
    setPendingAction(null);
    const [nextProduct, ...remainingProducts] =
      pendingRecommendedProductsRef.current;
    pendingRecommendedProductsRef.current = remainingProducts;
    if (nextProduct) {
      void startProductConfiguration({
        type: "confirm_add_to_cart",
        productId: nextProduct.productId,
        productName: nextProduct.productName,
        quantity: 1,
      });
    } else {
      setAgentStage("idle");
    }
  };

  const chooseProduct = async (recommendation: Recommendation) => {
    const recommendationKey = `${recommendation.role}-${recommendation.productId}`;
    setLoadingRecommendation(recommendationKey);
    setNotice("");

    try {
      const product = await getProductById(recommendation.productId);

      setProductToCustomize(product);
      setOptions({});
      setSpecialInstruction("");
      setPendingQuantity(1);
      setOptionGroupIndex(0);
      setAgentStage(
        product.optionGroups?.length ? "awaiting_option" : "awaiting_instruction",
      );
      setMessages((current) => [
        ...current,
        {
          from: "assistant",
          text: product.optionGroups?.length
            ? `Selecciona por chat las opciones de ${product.productName}. ¿Qué ${product.optionGroups[0].name.toLowerCase()} deseas? Opciones: ${product.optionGroups[0].options.join(", ")}.`
            : `¿Quieres agregar una indicación especial para ${product.productName}? Escríbela o responde "ninguna".`,
        },
      ]);
    } catch {
      setNotice("No pude cargar las opciones de ese platillo. Inténtalo de nuevo.");
    } finally {
      setLoadingRecommendation(null);
    }
  };

  const isConfirmation = (value: string) =>
    /^(sí|si|s[ií]|claro|dale|agrégala|agregar|agrega los dos|agrega ambos|confirmo|ok|okay)$/i.test(
    value.trim(),
  );

const isCancellation = (value: string) =>
  /^(no|cancelar|cancela|mejor no|no la agregues)$/i.test(
    value.trim(),
  );

  return (
    <>
      {isOpen && (
        <section
          aria-label="Asistente del menú"
          style={{ left: panelPosition.left, top: panelPosition.top, width: panelPosition.width }}
          className="fixed z-59 flex h-[min(75vh,36rem)] flex-col overflow-hidden rounded-3xl  bg-white shadow-2xl"
        >
          <header className="flex items-center justify-between bg-mint-darker p-3 text-white">
            <div className="flex items-center gap-2">

              <Bot animateOnHover />
              <span className="font-bold">Asistente del menú</span>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Cerrar chat">
              <LuX className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-neutral-50 p-3">
            {messages.length === 0 && (
              <p className="max-w-[90%] rounded-2xl bg-white p-3 text-sm shadow-sm">
                ¡Hola! ¿Qué te gustaría comer y cuál es tu presupuesto? Te recomiendo platillos para cada ocasión.
              </p>
            )}

            {messages.map((message, index) => (
              <div
                key={`${message.from}-${index}`}
                className={`max-w-[92%] rounded-2xl p-3 text-sm ${message.from === "client"
                    ? "ml-auto bg-mint-dark text-white"
                    : "bg-white text-text-primary shadow-sm"
                  }`}
              >
                <p>{message.text}</p>

                {message.recommendations?.map((item) => (
                  <article key={`${item.role}-${item.productId}`} className="mt-3 rounded-xl bg-neutral-50 p-3 text-text-primary">
                    <p className="text-xs font-bold uppercase text-mint-dark">{roleName[item.role]}</p>
                    <div className="mt-1 flex justify-between gap-2">
                      <strong>{item.productName}</strong>
                      <strong>₡{item.price.toLocaleString("es-CR")}</strong>
                    </div>
                    <p className="mt-1 text-xs">{item.reason}</p>
                    <button
                      type="button"
                      disabled={isSending || loadingRecommendation !== null}
                      onClick={() => void chooseProduct(item)}
                      className="mt-3 w-full rounded-xl bg-mint-darker p-2 font-semibold text-white"
                    >
                      {loadingRecommendation === `${item.role}-${item.productId}`
                        ? "Agregando..."
                        : "Agregar al carrito"}
                    </button>
                  </article>
                ))}
              </div>
            ))}

            {isSending && (
              <p className="flex items-center gap-2 text-sm text-neutral-600">
                <LuLoaderCircle className="h-4 w-4 animate-spin" />
                Un momento...
              </p>
            )}

            {notice && <p role="status" className="text-sm text-mint-dark">{notice}</p>}
          </div>

          <form onSubmit={sendMessage} className="flex gap-2 border-t border-border p-3">
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              disabled={!mesaId || isSending || loadingRecommendation !== null}
              placeholder="Escribe tu mensaje..."
              className="min-w-0 flex-1 rounded-full border border-border px-3"
            />
            <button
              type="submit"
              disabled={!mesaId || isSending || loadingRecommendation !== null || !text.trim()}
              aria-label="Enviar mensaje"
              className="rounded-full bg-mint-dark p-3 text-white disabled:opacity-50"
            >
              <LuSend className="h-4 w-4" />
            </button>
          </form>
        </section>
      )}

      <button
        ref={buttonRef}
        type="button"
        onPointerDown={startDragging}
        onPointerMove={dragButton}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onClick={toggleChat}
        aria-label={isOpen ? "Cerrar asistente" : "Abrir asistente"}
        title="Arrastra para mover"
        style={buttonPosition ? { left: buttonPosition.left, top: buttonPosition.top } : undefined}
        className={`fixed z-60 flex h-14 w-14 touch-none cursor-grab items-center justify-center rounded-full bg-mint-darker text-white shadow-xl ring-4 ring-white active:cursor-grabbing ${buttonPosition ? "" : "bottom-24 right-5"}`}
      >
        {isOpen ? <LuX className="h-6 w-6" /> : <Bot animation="blink" animate loop />}
      </button>
    </>
  );
}

export default MenuAssistant;
