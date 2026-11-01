
import { useEffect, useMemo, useState } from "react";
import {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    getExpenseInvoice,
    type Expense as ApiExpense,
    type ExpenseFormData,
} from "../../services/expenseService";
import {
    FiSearch,
    FiX,
    FiDollarSign,
    FiClipboard,
    FiDownload,
} from "react-icons/fi";
import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon } from "@animateicons/react/lucide";
import DashboardLayoutAdmin from "../layout/DashboardLayoutAdmin";
import ConfirmDeleteModal from "../shared/ConfirmDeleteModal";
import trash from "react-useanimations/lib/trash";
import { UseAnimations } from "react-useanimations";
import { FileDownIcon, Pen01Icon } from "@animateicons/react/huge";

type Expense = {
    id: number;
    motive: string;
    amount: number;
    supplier: string;
    date: string;
    observations: string;
    invoiceKey: string | null;
};

type ExpenseForm = Omit<Expense, "id" | "invoiceKey">;

const mapApiExpense = (expense: ApiExpense): Expense => ({
    id: expense.expense_id,
    motive: expense.motive,
    amount: Number(expense.amount),
    supplier: expense.supplier,
    date: expense.date.slice(0, 10),
    observations: expense.observations ?? "",
    invoiceKey: expense.invoice_key ?? null,
});

const emptyForm: ExpenseForm = {
    motive: "",
    amount: 0,
    supplier: "",
    date: new Date().toLocaleDateString("en-CA"),
    observations: "",
};


const formatMoney = (amount: number) =>
    `₡${amount.toLocaleString("es-CR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

function Expenses() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [form, setForm] = useState<ExpenseForm>(emptyForm);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isPrinting, setIsPrinting] = useState(false);

    const [loading, setLoading] = useState(true);

    const loadExpenses = async () => {
        try {
            setError("");

            const data = await getExpenses();
            setExpenses(data.map(mapApiExpense));
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudieron cargar los egresos",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadExpenses();
    }, []);

    const filteredExpenses = useMemo(() => {
        const query = search.trim().toLowerCase();

        return expenses
            .filter((expense) => {
                const matchesSearch =
                    expense.motive.toLowerCase().includes(query) ||
                    expense.supplier.toLowerCase().includes(query);

                const matchesStart =
                    !startDate || expense.date >= startDate;

                const matchesEnd =
                    !endDate || expense.date <= endDate;

                return matchesSearch && matchesStart && matchesEnd;
            })
            .sort((a, b) => b.date.localeCompare(a.date));
    }, [expenses, search, startDate, endDate]);

    const total = filteredExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0,
    );

    useEffect(() => {
        if (!isPrinting) {
            return;
        }

        const handleAfterPrint = () => setIsPrinting(false);

        window.addEventListener("afterprint", handleAfterPrint);
        window.setTimeout(() => window.print(), 0);

        return () => {
            window.removeEventListener("afterprint", handleAfterPrint);
        };
    }, [isPrinting]);

    const exportFilteredExpenses = () => {
        if (filteredExpenses.length === 0) {
            setError("No hay egresos filtrados para exportar.");
            return;
        }

        setIsPrinting(true);
    };

    const openInvoice = async (expenseId: number) => {
        try {
            setError("");

            const invoice = await getExpenseInvoice(expenseId);
            const invoiceUrl = URL.createObjectURL(invoice);

            const newWindow = window.open(invoiceUrl, "_blank");

            if (!newWindow) {
                URL.revokeObjectURL(invoiceUrl);
                setError("El navegador bloqueó la apertura de la factura. Permite las ventanas emergentes e inténtalo de nuevo.");
                return;
            }

            newWindow.opener = null;
        } catch (error) {
            console.error("Error al abrir la factura:", error);
            setError("No se pudo abrir la factura. Inténtalo de nuevo.");
        }
    };

    const openNewForm = () => {
        setForm({ ...emptyForm });
        setEditingId(null);
        setInvoiceFile(null);
        setError("");
        setShowForm(true);
    };

    const openEditForm = (expense: Expense) => {
        const { id, ...fields } = expense;
        setForm(fields);
        setEditingId(id);
        setInvoiceFile(null);
        setError("");
        setShowForm(true);
    };

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();
        setError("");

        if (form.motive.trim().length < 2 || !form.supplier.trim() ||
            form.supplier.trim().length < 2) {
            setError("El motivo y el proveedor deben tener al menos 2 caracteres.");
            return;
        }

        if (!Number.isFinite(form.amount) || form.amount <= 0) {
            setError("El monto debe ser mayor que cero.");
            return;
        }

        if (!form.date) {
            setError("Selecciona la fecha del egreso.");
            return;
        }

        const data: ExpenseFormData = {
            motive: form.motive.trim(),
            amount: form.amount,
            supplier: form.supplier.trim(),
            date: form.date,
            observations: form.observations.trim(),
            invoice: invoiceFile,
        };

        try {
            setIsSaving(true);
            setLoading(true);

            if (editingId !== null) {
                await updateExpense(editingId, data);
            } else {
                await createExpense(data);
            }

            await loadExpenses();

            setShowForm(false);
            setForm({ ...emptyForm });
            setEditingId(null);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo guardar el egreso.",
            );
        } finally {
            setIsSaving(false);
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            setError("");
            setDeletingId(id);
            setLoading(true);

            await deleteExpense(id);
            await loadExpenses();
            setExpenseToDelete(null);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo eliminar el egreso.",
            );
        } finally {
            setDeletingId(null);
            setLoading(false);
        }
    };

    return (
        <DashboardLayoutAdmin>
            <ConfirmDeleteModal
                isOpen={expenseToDelete !== null}
                title="¿Eliminar factura?"
                message={
                    expenseToDelete
                        ? `¿Deseas eliminar la factura de "${expenseToDelete.motive}"? Esta acción no se puede deshacer.`
                        : ""
                }
                isLoading={deletingId !== null}
                onCancel={() => setExpenseToDelete(null)}
                onConfirm={() => {
                    if (expenseToDelete) {
                        void handleDelete(expenseToDelete.id);
                    }
                }}
            />
            {/* Esta parte es para definir como se ve la tabla en el pdf*/}
            <style>{`
                .print-export {
                    display: none;
                }

                @media print {
                    body * {
                        visibility: hidden;
                    }

                    .print-export,
                    .print-export * {
                        visibility: visible;
                    }

                    .print-export {
                        display: block;
                        position: absolute;
                        inset: 0;
                        width: 100%;
                        padding: 24px;
                        color: #111827;
                        background: white;
                    }
                }
            `}</style>

            <div className="print-export">
                <h1 style={{ fontSize: "22px", fontWeight: 700 }}>
                    Reporte de egresos
                </h1>
                <table
                    style={{
                        width: "100%",
                        marginTop: "20px",
                        borderCollapse: "collapse",
                        fontSize: "12px",
                    }}
                >
                    <thead>
                        <tr>
                            {["Fecha", "Motivo", "Proveedor", "Observaciones", "Monto"].map(
                                (heading) => (
                                    <th
                                        key={heading}
                                        style={{
                                            border: "1px solid #9ca3af",
                                            padding: "8px",
                                            textAlign: "left",
                                            background: "#f3f4f6",
                                        }}
                                    >
                                        {heading}
                                    </th>
                                ),
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExpenses.map((expense) => (
                            <tr key={expense.id}>
                                <td style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                                    {expense.date}
                                </td>
                                <td style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                                    {expense.motive}
                                </td>
                                <td style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                                    {expense.supplier}
                                </td>
                                <td style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                                    {expense.observations || "—"}
                                </td>
                                <td style={{ border: "1px solid #9ca3af", padding: "8px", textAlign: "right" }}>
                                    {formatMoney(expense.amount)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td
                                colSpan={4}
                                style={{
                                    border: "1px solid #9ca3af",
                                    padding: "8px",
                                    textAlign: "right",
                                    fontWeight: 700,
                                }}
                            >
                                Total
                            </td>
                            <td
                                style={{
                                    border: "1px solid #9ca3af",
                                    padding: "8px",
                                    textAlign: "right",
                                    fontWeight: 700,
                                }}
                            >
                                {formatMoney(total)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            {/*Aquí termina*/}

            <section className="px-4 py-6 sm:px-6 lg:px-15 lg:py-15">
                <div className="mx-auto w-full max-w-7xl">
                    <div className="mb-6">
                        <div>
                            <Link
                                to="/dashboardAdmin"
                                className="mb-2 flex items-center gap-1 text-sm text-mint-dark md:hidden"
                            >
                                <ArrowLeftIcon
                                    size={28}
                                    duration={1}
                                />
                                <span className="text-[32px] font-bold text-mint-dark sm:text-3xl">Reporte de egresos</span>

                            </Link>

                            <h1 className="hidden text-2xl font-bold text-mint-dark md:block sm:text-3xl">
                                Reporte de egresos
                            </h1>
                        </div>

                    </div>

                    {/* Resumen */}
                    <div className="mb-6 grid gap-4 sm:grid-cols-2">
                        <article className="rounded-xl border border-border bg-mint-darker p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint-darker border border-white">
                                    <FiDollarSign className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-white">
                                        Total de egresos
                                    </p>
                                    <p className="mt-1 text-xl font-bold text-white">
                                        {formatMoney(total)}
                                    </p>
                                </div>
                            </div>
                        </article>

                        <article className="rounded-xl border border-border bg-mint-darker p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint-darker border border-white">
                                    <FiClipboard className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-white">
                                        Registros encontrados
                                    </p>
                                    <p className="mt-1 text-xl font-bold text-white">
                                        {filteredExpenses.length}
                                    </p>
                                </div>
                            </div>
                        </article>
                    </div>

                    {/* Formulario */}
                    {showForm && (
                        <section className="mb-6 rounded-2xl border border-border bg-white p-5 sm:p-6">
                            <div className="mb-5 flex items-center justify-between gap-3">
                                <h2 className="text-[24px] font-bold text-mint-dark">
                                    {editingId !== null
                                        ? "Editar egreso"
                                        : "Registrar nuevo egreso"}
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    aria-label="Cerrar formulario"
                                    className="cursor-pointer rounded-lg p-2 text-text-primary hover:bg-gray-100"
                                >
                                    <FiX className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <input
                                        required
                                        maxLength={150}
                                        value={form.motive}
                                        onChange={(event) =>
                                            setForm({ ...form, motive: event.target.value })
                                        }
                                        placeholder="Motivo del egreso (Ej. Compra de insumos)"
                                        className="mt-5 w-full font-normal text-black text-base rounded-lg border border-border focus:border-2 focus:border-brown focus:outline-none px-4 py-1.5 "
                                    />

                                    <input
                                        required
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={form.amount || ""}
                                        onChange={(event) =>
                                            setForm({
                                                ...form,
                                                amount: Number(event.target.value),
                                            })
                                        }
                                        placeholder="Monto del egreso (Ej. 1500.00)"
                                        className="mt-5 w-full font-normal text-black text-base rounded-lg border border-border focus:border-2 focus:border-brown focus:outline-none px-4 py-1.5 "
                                    />


                                    <input
                                        required
                                        maxLength={150}
                                        value={form.supplier}
                                        onChange={(event) =>
                                            setForm({ ...form, supplier: event.target.value })
                                        }
                                        placeholder="Proveedor o establecimiento (Ej. Supermercado X)"
                                        className="mt-5 w-full font-normal text-black text-base rounded-lg border border-border focus:border-2 focus:border-brown focus:outline-none px-4 py-1.5 "
                                    />


                                    <input
                                        required
                                        type="date"
                                        value={form.date}
                                        onChange={(event) =>
                                            setForm({ ...form, date: event.target.value })
                                        }
                                        className="mt-5 w-full font-normal text-black text-base rounded-lg border border-border focus:border-2 focus:border-brown focus:outline-none px-4 py-1.5 "
                                    />
                                </div>

                                <textarea
                                    rows={3}
                                    maxLength={500}
                                    value={form.observations}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            observations: event.target.value,
                                        })
                                    }
                                    placeholder="Agrega algún detalle adicional..."
                                    className="mt-5 w-full font-normal text-black text-base rounded-lg border border-border focus:border-2 focus:border-brown focus:outline-none px-4 py-1.5 "
                                />


                                <div className="mt-5">
                                    <label
                                        htmlFor="invoice"
                                        className="mb-2 block text-sm font-semibold text-mint-dark"
                                    >
                                        Factura en PDF{" "}
                                        <span className="font-normal text-gray-500">
                                            (opcional)
                                        </span>
                                    </label>

                                    <input
                                        id="invoice"
                                        type="file"
                                        accept=".pdf,application/pdf"
                                        onChange={(event) => {
                                            const file = event.target.files?.[0] ?? null;

                                            if (file && file.size > 5 * 1024 * 1024) {
                                                setError("La factura no puede superar los 5 MB.");
                                                event.target.value = "";
                                                setInvoiceFile(null);
                                                return;
                                            }

                                            if (
                                                file &&
                                                (
                                                    file.type !== "application/pdf" ||
                                                    !file.name.toLowerCase().endsWith(".pdf")
                                                )
                                            ) {
                                                setError("Selecciona una factura en formato PDF.");
                                                event.target.value = "";
                                                setInvoiceFile(null);
                                                return;
                                            }

                                            setError("");
                                            setInvoiceFile(file);
                                        }}
                                        className="block w-full rounded-lg border border-border px-4 py-2 text-sm text-black file:mr-3 file:rounded-md file:border-0 file:bg-mint-dark file:px-3 file:py-2 file:text-white"
                                    />

                                    <p className="mt-1 text-xs text-gray-500">
                                        Solo archivos PDF. Tamaño máximo: 5 MB.
                                    </p>

                                    {invoiceFile && (
                                        <p className="mt-1 text-sm text-mint-dark">
                                            Archivo seleccionado: {invoiceFile.name}
                                        </p>
                                    )}
                                </div>


                                {error && (
                                    <p role="alert" className="text-sm text-red-600">
                                        {error}
                                    </p>
                                )}

                                <div className="flex flex-wrap justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        disabled={isSaving}
                                        className="cursor-pointer px-4 py-2.5 text-sm hover:bg-gray-50 rounded-lg border text-mint-darker border-mint-darker font-bold disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="cursor-pointer text-sm rounded-lg bg-mint-dark px-4 py-3 text-white font-bold disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isSaving
                                            ? "Guardando cambios..."
                                            : editingId !== null
                                                ? "Guardar cambios"
                                                : "Guardar egreso"}
                                    </button>
                                </div>
                            </form>
                        </section>
                    )}

                    {/* Historial y filtros */}
                    <section className="overflow-hidden rounded-2xl border border-border bg-white">
                        <div className="border-b border-border p-5">
                            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <h2 className="text-[24px] font-bold text-mint-dark">
                                    Historial de egresos
                                </h2>

                                <div className="flex w-full gap-2 sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={openNewForm}
                                        className="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-mint-dark px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-mint-darker hover:opacity-90 sm:px-4"
                                    >
                                        <span className="hidden sm:inline">Registrar egreso</span>
                                        <span className="sm:hidden">Registrar</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={exportFilteredExpenses}
                                        disabled={loading || filteredExpenses.length === 0 || isPrinting}
                                        className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-mint-dark px-3 py-2 text-sm font-semibold text-mint-darker transition hover:bg-mint-darker/10 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
                                    >
                                        <FiDownload />
                                        Exportar
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                <div className="relative md:self-end">
                                    <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="search"
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Buscar motivo o proveedor..."
                                        className="w-full rounded-lg border border-border py-2.5 pl-9 pr-3 text-sm outline-none focus:border-mint-dark"
                                    />
                                </div>

                                <label className="text-sm text-text-primary">
                                    Desde
                                    <input
                                        type="date"
                                        value={startDate}
                                        max={endDate || undefined}
                                        onChange={(event) => setStartDate(event.target.value)}
                                        className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-mint-dark"
                                    />
                                </label>

                                <label className="text-sm text-text-primary">
                                    Hasta
                                    <input
                                        type="date"
                                        value={endDate}
                                        min={startDate || undefined}
                                        onChange={(event) => setEndDate(event.target.value)}
                                        className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-mint-dark"
                                    />
                                </label>
                            </div>
                        </div>

                        {loading ? (
                            <div className="px-5 py-12 text-center text-sm text-text-primary">
                                Cargando egresos...
                            </div>
                        ) : filteredExpenses.length === 0 ? (
                            <div className="px-5 py-12 text-center">
                                <h3 className="mt-3 font-semibold text-mint-dark">
                                    No hay egresos para mostrar
                                </h3>
                                <p className="mt-1 text-sm text-text-primary">
                                    Registra un egreso o modifica los filtros de búsqueda.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Vista para móvil */}
                                <div className="max-h-120 divide-y divide-border overflow-y-auto md:hidden">
                                    {filteredExpenses.map((expense) => (
                                        <article key={expense.id} className="space-y-3 p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h3 className="wrap-break-word font-semibold text-mint-dark">
                                                        {expense.motive}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-text-primary">
                                                        {expense.supplier}
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {expense.date}
                                                    </p>
                                                </div>
                                                <p className="shrink-0 font-bold text-mint-dark">
                                                    {formatMoney(expense.amount)}
                                                </p>
                                            </div>

                                            {expense.observations && (
                                                <p className="wrap-break-word text-sm text-text-primary">
                                                    {expense.observations}
                                                </p>
                                            )}

                                            <div className="flex justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (expense.invoiceKey) {
                                                            void openInvoice(expense.id);
                                                        }
                                                    }}
                                                    disabled={!expense.invoiceKey}
                                                    aria-label={
                                                        expense.invoiceKey
                                                            ? "Ver factura"
                                                            : "Factura no disponible"
                                                    }
                                                    title={
                                                        expense.invoiceKey
                                                            ? "Ver factura"
                                                            : "Factura no disponible"
                                                    }
                                                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-mint-dark disabled:cursor-not-allowed disabled:text-gray-300"
                                                >
                                                    <FileDownIcon
                                                        size={25}
                                                        duration={1}

                                                    />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => openEditForm(expense)}
                                                    aria-label="Editar egreso"
                                                    title="Editar egreso"
                                                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-mint-dark transition hover:text-mint-darker"
                                                >
                                                    <Pen01Icon
                                                        size={25}
                                                        duration={1}
                                                    />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setExpenseToDelete(expense)}
                                                    aria-label="Eliminar egreso"
                                                    title="Eliminar egreso"
                                                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-red-500 transition hover:text-red-700"
                                                >
                                                    <UseAnimations
                                                        animation={trash}
                                                        size={25}
                                                        interaction="hover"
                                                    />
                                                </button>
                                            </div>
                                        </article>
                                    ))}
                                </div>

                                {/* Tabla para escritorio */}
                                <div className="hidden max-h-92 overflow-auto md:block">
                                    <table className="w-full text-left text-sm">
                                        <thead className="sticky top-0 z-10 bg-neutral-100 px-4 py-3 text-sm font-semibold text-text-primary ">
                                            <tr>
                                                <th className="px-5 py-3 font-semibold">Fecha</th>
                                                <th className="px-5 py-3 font-semibold">Motivo</th>
                                                <th className="px-5 py-3 font-semibold">Proveedor</th>
                                                <th className="px-5 py-3 font-semibold">Monto</th>
                                                <th className="px-5 py-3 text-right font-semibold">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {filteredExpenses.map((expense) => (
                                                <tr key={expense.id} className="hover:bg-gray-50">
                                                    <td className="whitespace-nowrap text-mint-darker font-semibold px-5 py-4">
                                                        {expense.date}
                                                    </td>
                                                    <td className="max-w-56 wrap-break-word px-5 py-4 font-medium text-sm text-text-primary">
                                                        {expense.motive}
                                                        {expense.observations && (
                                                            <p className="mt-1 wrap-break-word  font-normal text-sm text-text-primary">
                                                                {expense.observations}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="max-w-48 wrap-break-word px-5 py-4 text-sm text-text-primary">
                                                        {expense.supplier}
                                                    </td>
                                                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-sm text-text-primary">
                                                        {formatMoney(expense.amount)}
                                                    </td>
                                                    <td className="whitespace-nowrap px-5 py-4">
                                                        <div className="flex justify-end gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (expense.invoiceKey) {
                                                                        void openInvoice(expense.id);
                                                                    }
                                                                }}
                                                                disabled={!expense.invoiceKey}
                                                                aria-label={
                                                                    expense.invoiceKey
                                                                        ? "Ver factura"
                                                                        : "Factura no disponible"
                                                                }
                                                                title={
                                                                    expense.invoiceKey
                                                                        ? "Ver factura"
                                                                        : "Factura no disponible"
                                                                }
                                                                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-mint-dark disabled:cursor-not-allowed disabled:text-gray-300"
                                                            >
                                                                <FileDownIcon
                                                                    size={25}
                                                                    duration={1}

                                                                />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditForm(expense)}
                                                                aria-label="Editar egreso"
                                                                title="Editar egreso"
                                                                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-mint-dark transition hover:text-mint-darker"
                                                            >
                                                                <Pen01Icon
                                                                    size={25}
                                                                    duration={1}
                                                                />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setExpenseToDelete(expense)}
                                                                aria-label="Eliminar egreso"
                                                                title="Eliminar egreso"
                                                                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-red-500 transition hover:text-red-700"
                                                            >
                                                                <UseAnimations
                                                                    animation={trash}
                                                                    size={25}
                                                                    interaction="hover"
                                                                />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </section>
                </div>
            </section>
        </DashboardLayoutAdmin>
    );
}

export default Expenses;
