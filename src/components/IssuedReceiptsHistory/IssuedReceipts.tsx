import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeftIcon } from "@animateicons/react/lucide";
import { FileDownIcon } from "@animateicons/react/huge";
import ConfirmDeleteModal from "../shared/ConfirmDeleteModal";
import {

    FiDownload,
    FiInfo,
    FiMail,
    FiRefreshCw,
    FiSearch,
    FiSend,

} from "react-icons/fi";

import { LuFilePlus } from "react-icons/lu";

import DashboardLayoutAdmin from "../layout/DashboardLayoutAdmin";

import {

    RECEIPT_EMAIL_RESEND_ENABLED,

    ReceiptApiError,
    downloadReceiptXml,
    issueReplacementReceipt,
    listReceipts,
    refreshReceiptStatus,
    resendReceiptEmail,
    retryReceiptSend,
} from "../../services/receiptService";

import type {

    Receipt,
    ReceiptListResponse,
    ReceiptStatus,
    ReceiptStatusFilter,

} from "../../services/receiptService";

const PAGE_SIZE = 50;
const IN_PROGRESS: ReceiptStatus[] = ["pending", "queued", "signing", "sent", "polling"];
const STATUS_META: Record<ReceiptStatus, { label: string; className: string }> = {

    pending: { label: "En proceso", className: "text-amber-700" },
    queued: { label: "En proceso", className: "text-amber-700" },
    signing: { label: "En proceso", className: "text-amber-700" },
    sent: { label: "En proceso", className: "text-amber-700" },
    polling: { label: "En proceso", className: "text-amber-700" },
    accepted: { label: "Aceptado", className: "text-text-primary" },
    rejected: { label: "Rechazado", className: "text-red-700" },
    failed: { label: "Falló el envío", className: "text-orange-700" },

};


export interface ReceiptActionResponse {
    receiptId: number;
    haciendaStatus: string;
    haciendaMessage?: string | null;
    clave: string | null;
    consecutiveNumber: string | null;
}

const STATUS_OPTIONS: { value: ReceiptStatusFilter; label: string }[] = [

    { value: "", label: "Todos" },
    { value: "accepted", label: "Aceptado" },
    { value: "rejected", label: "Rechazado" },
    { value: "in_progress", label: "En proceso" },
    { value: "failed", label: "Falló el envío" },

];

const DOCUMENT_TYPES: Record<string, string> = {

    "03": "Nota de crédito",
    "04": "Tiquete",

};

type ActionKey = "xml" | "refresh" | "retry" | "replace" | "email";
type PeriodKey = "Hoy" | "Esta semana" | "Este mes" | "Este año";
const PERIODS: PeriodKey[] = ["Hoy", "Esta semana", "Este mes", "Este año"];

const formatMoney = (value: number) => `₡${value.toLocaleString("es-CR")}`;

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-CR", {
        day: "numeric",
        month: "short",
    });
// Formato de fecha local para evitar cambios de día por UTC.
const toInputDate = (date: Date) => {

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${date.getFullYear()}-${month}-${day}`;

};
// La semana comienza el lunes; el mes corresponde al mes en curso.
const periodRange = (period: PeriodKey) => {

    const now = new Date();

    const year = now.getFullYear();

    const month = now.getMonth();

    let from: Date;

    let to: Date;

    switch (period) {

        case "Hoy":

            from = to = now;

            break;

        case "Esta semana": {
            const daysFromMonday = now.getDay() === 0 ? 6 : now.getDay() - 1;
            from = new Date(year, month, now.getDate() - daysFromMonday);
            to = new Date(year, month, from.getDate() + 6);
            break;
        }
        case "Este mes":
            from = new Date(year, month, 1);
            to = now;
            break;

        case "Este año":
            from = new Date(year, 0, 1);
            to = now;
            break;
    }

    return { from: toInputDate(from), to: toInputDate(to) };

};

const errorText = (error: unknown) =>

    error instanceof Error ? error.message : "Ocurrió un error inesperado.";

const smallButton =

    "rounded border border-mint-dark px-3 py-1 text-xs font-semibold text-mint-darker transition hover:bg-mint-dark hover:text-white disabled:cursor-not-allowed disabled:opacity-60";

const filledButton =

    "rounded bg-mint-dark px-3 py-1 text-xs font-semibold text-white transition hover:bg-mint-darker disabled:cursor-not-allowed disabled:opacity-60";

const outlineButton =

    "cursor-pointer rounded-lg border border-mint-darker px-4 py-2.5 text-sm font-bold text-mint-darker hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60";

const iconButton =

    "flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-mint-dark transition hover:text-mint-darker disabled:cursor-not-allowed disabled:text-gray-300";

function Modal({

    title,

    onClose,

    children,

}: {

    title: string;

    onClose: () => void;

    children: ReactNode;

}) {

    return (

        <motion.div

            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"

            initial={{ opacity: 0 }}

            animate={{ opacity: 1 }}

            exit={{ opacity: 0 }}

            onClick={onClose}

        >

            <div

                role="dialog"

                aria-modal="true"

                aria-label={title}

                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"

                onClick={(event) => event.stopPropagation()}

            >

                <h3 className="text-lg font-bold text-mint-dark">{title}</h3>

                <div className="mt-3 text-sm text-text-primary">{children}</div>

            </div>

        </motion.div>

    );

}

function ReceiptActions({

    receipt,

    busyAction,

    disabled,

    onAction,

    onShowMessage,

}: {

    receipt: Receipt;

    busyAction: ActionKey | null;

    disabled: boolean;

    onAction: (action: ActionKey, receipt: Receipt) => void;

    onShowMessage: (receipt: Receipt) => void;

}) {

    const inProgress = IN_PROGRESS.includes(receipt.status);
    const isRejected = receipt.status === "rejected";
    const isFailed = receipt.status === "failed";
    const isAccepted = receipt.status === "accepted";
    const iconClass = "h-6 w-6";
    return (
        <div className="flex items-center justify-end gap-1">
            {receipt.hasXml && (

                <button
                    type="button"
                    title="Descargar XML"
                    aria-label="Descargar XML"
                    className={iconButton}
                    disabled={disabled}
                    onClick={() => onAction("xml", receipt)}
                >

                    <span className={busyAction === "xml" ? "animate-pulse" : ""}>

                        <FileDownIcon size={25} duration={1} />

                    </span>

                </button>

            )}

            {(isRejected || isFailed) && receipt.haciendaMessage && (

                <button

                    type="button"

                    title="Ver mensaje de Hacienda"

                    aria-label="Ver mensaje de Hacienda"

                    className={iconButton}

                    onClick={() => onShowMessage(receipt)}

                >

                    <FiInfo className={iconClass} />

                </button>

            )}

            {inProgress && (

                <button

                    type="button"

                    title="Actualizar estado"

                    aria-label="Actualizar estado"

                    className={iconButton}

                    disabled={disabled}

                    onClick={() => onAction("refresh", receipt)}

                >

                    <FiRefreshCw

                        className={`${iconClass} ${busyAction === "refresh" ? "animate-spin" : ""}`}

                    />

                </button>

            )}

            {isFailed && receipt.documentType === "04" && (

                <button

                    type="button"

                    title="Reintentar envío"

                    aria-label="Reintentar envío"

                    className={iconButton}

                    disabled={disabled}

                    onClick={() => onAction("retry", receipt)}

                >

                    <FiSend

                        className={`${iconClass} ${busyAction === "retry" ? "animate-pulse" : ""}`}

                    />

                </button>

            )}

            {isRejected && receipt.documentType === "04" &&
                (receipt.replacedById ? (
                    <span className="px-2 text-xs text-gray-500">Ya fue sustituido</span>
                ) : (
                    <button
                        type="button"
                        title="Emitir reemplazo"
                        aria-label="Emitir reemplazo"
                        className={iconButton}
                        disabled={disabled}
                        onClick={() => onAction("replace", receipt)}
                    >
                        <LuFilePlus className={iconClass} />
                    </button>
                ))}

            {isAccepted && RECEIPT_EMAIL_RESEND_ENABLED && (

                <button

                    type="button"

                    title="Reenviar por correo"

                    aria-label="Reenviar por correo"

                    className={iconButton}

                    disabled={disabled}

                    onClick={() => onAction("email", receipt)}

                >

                    <FiMail

                        className={`${iconClass} ${busyAction === "email" ? "animate-pulse" : ""}`}

                    />

                </button>

            )}

        </div>

    );

}

function IssuedReceipts() {
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const initialRange = periodRange("Este mes");
    const [period, setPeriod] = useState<PeriodKey>("Este mes");
    const [from, setFrom] = useState(initialRange.from);
    const [to, setTo] = useState(initialRange.to);
    const [status, setStatus] = useState<ReceiptStatusFilter>("");
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [reloadKey, setReloadKey] = useState(0);
    const [data, setData] = useState<ReceiptListResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState<Error | null>(null);
    const [busy, setBusy] = useState<{ id: string; action: ActionKey } | null>(null);
    
    const [notice, setNotice] = useState<{ type: "ok" | "error"; text: string } | null>(

        null,

    );

    const [messageFor, setMessageFor] = useState<Receipt | null>(null);

    const [replaceFor, setReplaceFor] = useState<Receipt | null>(null);
    // Búsqueda con debounce por consecutivo o clave
    useEffect(() => {

        const timer = setTimeout(() => {

            setSearch(searchInput);

            setPage(1);

        }, 400);

        return () => clearTimeout(timer);

    }, [searchInput]);

    useEffect(() => {

        const controller = new AbortController();

        const load = async () => {

            setIsLoading(true);

            setLoadError(null);

            try {

                const response = await listReceipts(

                    { from, to, status, search, page, limit: PAGE_SIZE },

                    controller.signal,

                );

                setData((current) => {
                    const receivedItems =
                        page === 1
                            ? response.items
                            : [...(current?.items ?? []), ...response.items];

                    const uniqueItems = Array.from(
                        new Map(receivedItems.map((item) => [item.id, item])).values(),
                    );

                    return { ...response, items: uniqueItems };
                });

            } catch (error) {

                if (controller.signal.aborted) return;

                setData(null);

                setLoadError(error instanceof Error ? error : new Error("Error desconocido"));

            } finally {

                if (!controller.signal.aborted) {
                    setIsLoadingMore(false);
                    setIsLoading(false);
                }

            }

        };

        void load();

        return () => controller.abort();

    }, [from, to, status, search, page, reloadKey]);

    const selectPeriod = (option: PeriodKey) => {

        const range = periodRange(option);

        setPeriod(option);

        setFrom(range.from);

        setTo(range.to);

        setPage(1);

    };
    const handleListScroll = (event: React.UIEvent<HTMLDivElement>) => {
        const element = event.currentTarget;
        const nearBottom =
            element.scrollHeight - element.scrollTop - element.clientHeight < 100;

        if (
            nearBottom &&
            !isLoading &&
            !isLoadingMore &&
            data &&
            items.length < data.total
        ) {
            setIsLoadingMore(true);
            setPage((current) => current + 1);
        }
    };

    const runAction = async (action: ActionKey, receipt: Receipt) => {
        setBusy({ id: receipt.id, action });
        setNotice(null);
        try {

            if (action === "xml") {
                await downloadReceiptXml(receipt);
            } else if (action === "refresh") {
                await refreshReceiptStatus(receipt.id);
                setReloadKey((key) => key + 1);
            } else if (action === "retry") {
                await retryReceiptSend(receipt.id);
                setReloadKey((key) => key + 1);
            } else if (action === "replace") {
                const replacement = await issueReplacementReceipt(receipt.id);


                setReloadKey((key) => key + 1);

                if (replacement.emissionError) {
                    setNotice({
                        type: "error",
                        text: `No se pudo emitir el reemplazo: ${replacement.emissionError}`,
                    });
                } else {
                    setNotice({
                        type: "ok",
                        text: `Se emitió el tiquete ${replacement.consecutiveNumber ?? ""} que sustituye al rechazado.`,
                    });
                }
            } else {
                await resendReceiptEmail(receipt.id);
                setNotice({
                    type: "ok",
                    text: "Comprobante reenviado por correo.",
                });
            }

        } catch (error) {
            if (action === "replace") {
                setReloadKey((key) => key + 1);
            }

            setNotice({ type: "error", text: errorText(error) });
        } finally {
            setBusy(null);

        }
    };

    const handleAction = (action: ActionKey, receipt: Receipt) => {

        if (action === "replace") {

            setReplaceFor(receipt);

            return;

        }

        void runAction(action, receipt);

    };

    

    const items = data?.items ?? [];

    const summary = data?.summary;


    return (

        <DashboardLayoutAdmin>

            <motion.section

                className="px-6 lg:px-15 lg:py-15"

                initial={{ opacity: 0, y: 10 }}

                animate={{ opacity: 1, y: 0 }}

                transition={{ duration: 0.4, ease: "easeOut" }}

            >

                <div className="w-full">

                    <div className="flex items-center gap-2 md:hidden">

                        <Link to="/dashboardAdmin" className="flex items-center gap-2 text-mint-dark">

                            <ArrowLeftIcon size={28} duration={1} />

                            <span className="text-[32px] font-bold text-mint-dark">

                                Comprobantes emitidos

                            </span>

                        </Link>

                    </div>

                    <div className="hidden flex-wrap items-end justify-between gap-4 md:flex">

                        <h2 className="text-3xl font-bold text-mint-dark">Comprobantes emitidos</h2>

                    </div>

                    {/* Filtros y resumen */}

                    <div className="mt-5 w-full max-w-95 space-y-3">

                        <div>

                            <label className="mb-2 block text-xs font-medium text-text-primary">

                                Filtrar

                            </label>

                            <div className="flex flex-wrap gap-1.5">

                                {PERIODS.map((option) => (

                                    <button

                                        key={option}

                                        type="button"

                                        onClick={() => selectPeriod(option)}

                                        className={`rounded border px-3 py-1 text-sm transition ${period === option
                                            ? "border-mint-dark bg-mint-dark font-semibold text-white"
                                            : "border-mint-dark text-mint-darker hover:bg-mint-dark hover:text-white"
                                            }`}
                                    >

                                        {option}

                                    </button>

                                ))}

                            </div>

                        </div>

                        <div className="grid grid-cols-3 overflow-hidden rounded-xl bg-[#61B1A2] text-center text-white">

                            {[

                                ["Total emitido", formatMoney(summary?.total ?? 0)],

                                ["IVA cobrado", formatMoney(summary?.taxTotal ?? 0)],

                                ["Comprobantes aceptados", String(summary?.acceptedCount ?? 0)],

                            ].map(([label, value], index) => (

                                <div

                                    key={label}

                                    className={`flex min-h-19 flex-col items-center justify-center gap-1 px-2 py-3 ${index > 0 ? "border-l border-white/50" : ""

                                        }`}

                                >

                                    <span className="text-xs">{label}</span>

                                    <span className="text-sm font-bold">{value}</span>

                                </div>

                            ))}

                        </div>

                    </div>

                    {/* pop up d enotificacion/mensaje/error */}
                    {notice && (
                        <ConfirmDeleteModal
                            isOpen={true}
                            title={
                                notice.type === "error"
                                    ? "No se pudo completar la acción"
                                    : "Acción completada"
                            }
                            message={notice.text}
                            onConfirm={() => setNotice(null)}
                            onCancel={() => setNotice(null)}
                            confirmText="Entendido"
                            variant="message"
                        />
                    )}

                    {/* Historial de comprobantes */}

                    <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-white">

                        <div className="p-5">

                            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">

                                <h2 className="text-[24px] font-bold text-mint-dark">

                                    Historial de comprobantes

                                </h2>


                            </div>

                            <div className="mt-4 grid gap-3 md:grid-cols-2">

                                <div className="relative md:self-end">

                                    <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                                    <input
                                        type="search"
                                        value={searchInput}
                                        onChange={(event) => setSearchInput(event.target.value)}
                                        placeholder="Buscar por consecutivo o clave de Hacienda..."
                                        className="w-full rounded-lg border border-border py-2.5 pl-9 pr-3 text-sm outline-none focus:border-mint-dark"

                                    />

                                </div>

                                <label className="text-sm text-text-primary">

                                    Estado de Hacienda

                                    <select
                                        value={status}
                                        onChange={(event) => {
                                            setStatus(event.target.value as ReceiptStatusFilter);
                                            setPage(1);
                                        }}

                                        className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-mint-dark"

                                    >

                                        {STATUS_OPTIONS.map((option) => (

                                            <option key={option.value} value={option.value}>

                                                {option.label}

                                            </option>

                                        ))}

                                    </select>

                                </label>

                            </div>

                        </div>

                        {loadError ? (

                            <div className="px-5 py-12 text-center">

                                <h3 className="mt-3 font-semibold text-mint-dark">

                                    No se pudieron cargar los comprobantes

                                </h3>

                                <p className="mt-1 text-sm text-text-primary">

                                    {loadError instanceof ReceiptApiError && loadError.isMissingEndpoint

                                        ? "El backend todavía no expone GET /api/receipts."

                                        : loadError.message}

                                </p>

                                <button

                                    type="button"

                                    className={`${outlineButton} mt-4`}

                                    onClick={() => setReloadKey((key) => key + 1)}

                                >

                                    Reintentar

                                </button>

                            </div>

                        ) : isLoading && !data ? (

                            <div className="px-5 py-12 text-center text-sm text-text-primary">

                                Cargando comprobantes...

                            </div>

                        ) : items.length === 0 ? (

                            <div className="px-5 py-12 text-center">

                                <h3 className="mt-3 font-semibold text-mint-dark">

                                    No hay comprobantes para mostrar

                                </h3>

                                <p className="mt-1 text-sm text-text-primary">

                                    Cambia el periodo o modifica los filtros de búsqueda.

                                </p>

                            </div>

                        ) : (

                            <div className={isLoading ? "opacity-60 transition" : "transition"}>

                                {/* Vista para móvil */}

                                <div
                                    onScroll={handleListScroll}
                                   className="mx-5 max-h-120 divide-y divide-border overflow-y-auto rounded-xl border border-border md:hidden"
                                >

                                    {items.map((receipt, index) => (

                                        <motion.article

                                            key={receipt.id}

                                            initial={{ opacity: 0, x: -35 }}

                                            animate={{ opacity: 1, x: 0 }}

                                            transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}

                                            className="space-y-3 p-4"

                                        >

                                            <div className="flex items-start justify-between gap-3">

                                                <div className="min-w-0">

                                                    <h3 className="font-semibold text-mint-dark">

                                                        {DOCUMENT_TYPES[receipt.documentType] ?? receipt.documentType}

                                                    </h3>

                                                    <p className="mt-1 break-all text-sm text-text-primary">

                                                        {receipt.consecutivo}

                                                    </p>

                                                    <p className="mt-1 text-sm text-text-primary">
                                                        {formatDate(receipt.issuedAt)}
                                                    </p>

                                                </div>

                                                <div className="shrink-0 text-right">

                                                    <p className="font-bold text-mint-dark">{formatMoney(receipt.total)}</p>

                                                    <p className="mt-1 text-sm text-text-primary">

                                                        IVA {formatMoney(receipt.tax)}

                                                    </p>

                                                </div>

                                            </div>

                                            <p className={`text-sm font-medium ${STATUS_META[receipt.status].className}`}>

                                                {STATUS_META[receipt.status].label}

                                            </p>

                                            <ReceiptActions

                                                receipt={receipt}

                                                busyAction={busy?.id === receipt.id ? busy.action : null}

                                                disabled={busy !== null}

                                                onAction={handleAction}

                                                onShowMessage={setMessageFor}

                                            />

                                        </motion.article>

                                    ))}

                                </div>

                                {/* Tabla para escritorio */}

                                <div
                                    onScroll={handleListScroll}
                                   className="mx-5 hidden max-h-92 overflow-auto rounded-xl border border-border md:block"
                                >

                                    <table className="w-full text-left text-sm">

                                        <thead className="sticky top-0 z-10 bg-neutral-100 px-4 py-3 text-sm font-semibold text-text-primary">

                                            <tr>

                                                <th className="px-5 py-3 font-semibold">Fecha</th>

                                                <th className="px-5 py-3 font-semibold">Tipo</th>

                                                <th className="px-5 py-3 font-semibold">Consecutivo</th>

                                                <th className="px-5 py-3 font-semibold">Total</th>

                                                <th className="px-5 py-3 font-semibold">IVA</th>

                                                <th className="px-5 py-3 font-semibold">Estado</th>

                                                <th className="px-5 py-3 text-right font-semibold">Acciones</th>

                                            </tr>

                                        </thead>

                                        <tbody className="divide-y divide-border">

                                            {items.map((receipt, index) => (

                                                <motion.tr

                                                    key={receipt.id}

                                                    initial={{ opacity: 0, x: -35 }}

                                                    animate={{ opacity: 1, x: 0 }}

                                                    transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}

                                                    className="hover:bg-gray-50"

                                                >

                                                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-text-primary">
                                                        {formatDate(receipt.issuedAt)}
                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-text-primary">

                                                        {DOCUMENT_TYPES[receipt.documentType] ?? receipt.documentType}

                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-text-primary">

                                                        {receipt.consecutivo}

                                                    </td>

                                                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-text-primary">

                                                        {formatMoney(receipt.total)}

                                                    </td>

                                                    <td className="whitespace-nowrap px-5 py-4 text-sm text-text-primary">

                                                        {formatMoney(receipt.tax)}

                                                    </td>

                                                    <td

                                                        className={`whitespace-nowrap px-5 py-4 text-sm font-medium ${STATUS_META[receipt.status].className}`}

                                                    >

                                                        {STATUS_META[receipt.status].label}

                                                    </td>

                                                    <td className="whitespace-nowrap px-5 py-4">

                                                        <ReceiptActions

                                                            receipt={receipt}

                                                            busyAction={busy?.id === receipt.id ? busy.action : null}

                                                            disabled={busy !== null}

                                                            onAction={handleAction}

                                                            onShowMessage={setMessageFor}

                                                        />

                                                    </td>

                                                </motion.tr>

                                            ))}

                                        </tbody>

                                    </table>

                                </div>

                                {/* Paginación */}

                                <div className="flex items-center justify-between border-border p-4 text-sm text-text-primary">



                                </div>

                            </div>

                        )}

                    </section>

                </div>

            </motion.section>

            <AnimatePresence>

                {messageFor && (

                    <Modal title="Mensaje de Hacienda" onClose={() => setMessageFor(null)}>

                        <p className="whitespace-pre-wrap wrap-break-word">{messageFor.haciendaMessage}</p>

                        <p className="mt-3 break-all font-mono text-xs text-text-primary/70">

                            {messageFor.consecutivo}

                        </p>

                        <div className="mt-5 flex justify-end">

                            <button type="button" className={smallButton} onClick={() => setMessageFor(null)}>

                                Cerrar

                            </button>

                        </div>

                    </Modal>

                )}

                {replaceFor && (

                    <Modal title="Emitir reemplazo" onClose={() => setReplaceFor(null)}>

                        <p>

                            Hacienda rechazó el comprobante{" "}

                            <span className="font-mono text-xs">{replaceFor.consecutivo}</span>. Se emitirá

                            un comprobante nuevo, con otro consecutivo, que indica que sustituye al

                            rechazado.

                        </p>

                        <p className="mt-2">

                            No es un reenvío: el rechazado se conserva sin cambios y queda registrado.

                        </p>

                        <div className="mt-5 flex justify-end gap-2">

                            <button type="button" className={smallButton} onClick={() => setReplaceFor(null)}>

                                Cancelar

                            </button>

                            <button

                                type="button"

                                className={filledButton}

                                onClick={() => {

                                    const receipt = replaceFor;

                                    setReplaceFor(null);

                                    void runAction("replace", receipt);

                                }}

                            >

                                Emitir reemplazo

                            </button>

                        </div>

                    </Modal>

                )}

            </AnimatePresence>

        </DashboardLayoutAdmin>

    );

}

export default IssuedReceipts;
