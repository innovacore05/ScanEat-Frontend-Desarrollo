import type { PayOrderResponse } from "./billingService";

const METHOD_LABELS: Record<
  PayOrderResponse["payment"]["method"],
  string
> = {
  cash: "Efectivo",
  card: "Tarjeta",
  sinpe: "SINPE Móvil",
};

const esc = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character]!,
  );

const crc = (value: string | number) =>
  `₡${Number(value).toLocaleString("es-CR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;


const num = (value: string | number) =>
  Number(value).toLocaleString("es-CR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const row = (label: string, value: string) =>
  `<div class="r">
    <span>${esc(label)}</span>
    <span class="v">${esc(value)}</span>
  </div>`;

// Fila de totales: etiqueta | C | monto
const totalRow = (label: string, value: string, className = "") =>
  `<div class="t ${className}">
    <span class="tl">${esc(label)}</span>
    <span>C</span>
    <span class="ta">${esc(value)}</span>
  </div>`;

// Titulo de seccion con linea punteada que se extiende (SU PAGO :)
const section = (label: string) => `<div class="sec">${esc(label)}</div>`;

const divider = `<div class="line"></div>`;

function buildHtml(
  receipt: PayOrderResponse,
  logoUrl?: string | null,
  businessName?: string,
) {
  const date = new Date(receipt.issueDate).toLocaleString("es-CR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const payment = receipt.payment;
  const isCash = payment.method === "cash";
  const receiptSubtotal = receipt.lines.reduce(
    (subtotal, line) => subtotal + Number(line.subtotal),
    0,
  );
  const receiptDiscount = receipt.lines.reduce(
    (discount, line) => discount + Number(line.discount),
    0,
  );
  const receiptTaxByRate = receipt.lines.reduce((taxes, line) => {
    const rate = Number(line.ivaRate);
    taxes.set(rate, (taxes.get(rate) ?? 0) + Number(line.tax));
    return taxes;
  }, new Map<number, number>());

  const formatRate = (rate: number) =>
    `${new Intl.NumberFormat("es-CR", { maximumFractionDigits: 2 }).format(rate)}%`;

  const linesHtml = receipt.lines
    .map((line) => {
      const gross = Number(line.unitPrice) * line.quantity;
      const discountPct =
        Number(line.discount) > 0 && gross > 0
          ? (Number(line.discount) / gross) * 100
          : 0;

      return `
      <div class="item">
        <div class="item-name">${esc(line.detail)}</div>
        ${
          discountPct > 0
            ? `<div class="item-desc">Desc: ${formatRate(discountPct)}</div>`
            : ""
        }
        <div class="item-calc">
          <span>${line.quantity}</span>
          <span class="n">${num(line.unitPrice)}</span>
          <span class="n">${num(line.subtotal)}</span>
          <span class="n">iva${formatRate(Number(line.ivaRate))}</span>
        </div>
      </div>`;
    })
    .join("");

const ivaRows = [...receiptTaxByRate.entries()]
  .sort(([a], [b]) => a - b)
  .map(([rate, amount]) => totalRow(`IVA ${formatRate(rate)}`, num(amount)))
  .join("");



  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">

<style>
  @page {
    size: 80mm auto;
    margin: 0;
  }

  html,
  body {
    width: 80mm;
    margin: 0;
    padding: 0;
  }

  body {
    box-sizing: border-box;
    padding: 6mm 5mm 12mm;
    color: #000;
    font: 12px/1.5 "Courier New", monospace;
  }

  .c { text-align: center; }
  .b { font-weight: 700; }

  /* Emisor */
  .header {
    text-align: center;
    margin-bottom: 4mm;
  }

  .logo {
    display: block;
    width: 30mm;
    max-height: 25mm;
    object-fit: contain;
    margin: 0 auto 4mm;
  }

  .header .name {
    font-size: 15px;
    font-weight: 700;
    margin-bottom: 2mm;
  }

  .header div { margin: 1mm 0; }

  /* Separadores */
  .line {
    border-top: 1px dashed #000;
    margin: 4mm 0;
  }

  .title {
    text-align: center;
    font-weight: 700;
    letter-spacing: 2px;
    margin-bottom: 2mm;
  }

  /* Datos del comprobante */
  .r {
    display: flex;
    justify-content: space-between;
    gap: 3mm;
    padding: 0.8mm 0;
  }

  .r .v {
    text-align: right;
    word-break: break-all;
  }

  /* Detalle de pedido */
  .items-head {
    margin-bottom: 2mm;
  }

  .item {
    padding: 2mm 0;
  }

  .item-name {
    font-weight: 700;
    word-break: break-word;
  }

  .item-desc {
    margin-top: 0.5mm;
  }

  .item-calc {
    display: grid;
    grid-template-columns: 6mm 1fr 1fr 17mm;
    gap: 1.5mm;
    margin-top: 1mm;
  }

  .item-calc .n { text-align: right; }

  /* Totales: etiqueta | C | monto */
  .t {
    display: grid;
    grid-template-columns: 1fr 6mm auto;
    gap: 2mm;
    padding: 1mm 0;
    text-transform: uppercase;
  }

  .t .ta { text-align: right; }

  .t.big {
    font-size: 15px;
    font-weight: 700;
    padding: 1.5mm 0;
  }

  /* Titulo de seccion con linea punteada (SU PAGO :) */
  .sec {
    display: flex;
    align-items: center;
    gap: 2mm;
    margin-top: 3mm;
    text-transform: uppercase;
  }

  .sec::after {
    content: "";
    flex: 1;
    border-bottom: 1px dashed #000;
  }

  .legend {
    text-align: center;
    margin-top: 8mm;
    font-size: 11px;
  }

  .thanks {
    text-align: center;
    margin-top: 4mm;
    font-weight: 700;
  }
</style>

</head>

<body>

  <!-- Emisor -->
  <div class="header">
    ${logoUrl ? `<img src="${esc(logoUrl)}" class="logo" alt="Logo" />` : ""}
    <div class="name">${esc(businessName || "Nombre del negocio")}</div>
    <div>Cédula jurídica x-xxx-xxxxx</div>
    <div>Dirección,</div>
    <div>Tel 8888-8888</div>
  </div>

  ${divider}

  <!-- Datos del comprobante -->
  <div class="title">Tiquete Electrónico</div>
  ${row("Consecutivo", "Pendiente")}
  ${row("Fecha", date)}
  ${row("Clave numérica", "Pendiente")}
  ${row("Condición de venta", "Contado")}
  ${row("Cliente", "Cliente de contado")}

  ${divider}

  <!-- Detalle -->
  <div class="items-head">Cantidad - Precio - SubTotal</div>
  ${linesHtml}

  ${divider}

  <!-- Totales -->
  ${totalRow("Subtotal:", num(receiptSubtotal))}
  ${totalRow("Descuento:", num(receiptDiscount))}
  ${ivaRows}
  ${totalRow("Total:", num(receipt.totals.totalSale), "big")}

  <!-- Pago -->
  ${section("Su pago :")}
  ${totalRow(
    METHOD_LABELS[payment.method],
    num(isCash ? (payment.amountTendered ?? 0) : receipt.totals.totalSale),
  )}
  ${payment.reference ? row("Comprobante", payment.reference) : ""}

  ${
    isCash
      ? section("Su vuelto :") + totalRow("Efectivo", num(payment.change ?? 0))
      : ""
  }

  <div class="legend">iva = impuestos, C = Colones</div>
  <div class="thanks">¡Gracias por su visita!</div>

</body>
</html>`;
}

export function printReceipt(
  receipt: PayOrderResponse,
  logoUrl: string | null,
  businessName: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe");

    iframe.style.cssText =
      "position:fixed;width:0;height:0;border:0;visibility:hidden";

    iframe.srcdoc = buildHtml(receipt, logoUrl, businessName);

    const cleanup = () => setTimeout(() => iframe.remove(), 1000);

    iframe.onload = () => {
      try {
        const win = iframe.contentWindow;

        if (!win) {
          cleanup();
          reject(new Error("No se pudo abrir la ventana de impresión"));
          return;
        }

        win.onafterprint = () => {
          cleanup();
          resolve();
        };

        win.focus();
        win.print();
      } catch (error) {
        cleanup();
        reject(error);
      }
    };

    document.body.appendChild(iframe);
  });
}