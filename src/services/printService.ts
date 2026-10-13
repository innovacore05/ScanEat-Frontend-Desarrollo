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

const row = (label: string, value: string, className = "") =>
  `<div class="r ${className}">
    <span>${esc(label)}</span>
    <span>${esc(value)}</span>
  </div>`;

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

  const formatRate = (rate: number) =>
    `${new Intl.NumberFormat("es-CR", {
      maximumFractionDigits: 2,
    }).format(rate)}%`;

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
    padding: 4mm;
    color: #000;
    font: 12px/1.35 "Courier New", monospace;
  }

  .c {
    text-align: center;
  }

  .b {
    font-weight: 700;
  }

  .logo-container {
    text-align: center;
    margin-bottom: 4mm;
  }

  .logo {
    display: block;
    width: 30mm;
    max-height: 25mm;
    object-fit: contain;
    margin: 0 auto;
  }

  .r {
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }

  .big {
    font-size: 16px;
    font-weight: 700;
  }

  .item {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 7mm 15mm 18mm;
    gap: 2px;
    align-items: start;
  }

  .item span:not(:first-child) {
    text-align: right;
  }

  .item-header {
    font-weight: 700;
    border-bottom: 1px dashed #000;
    padding-bottom: 3px;
    margin-bottom: 4px;
  }

  .rate {
    display: block;
    font-size: 10px;
  }

  .old {
    display: block;
    font-size: 10px;
    text-decoration: line-through;
  }

  hr {
    border: 0;
    border-top: 1px dashed #000;
    margin: 6px 0;
  }
</style>

</head>

<body>

  ${
    logoUrl
      ? `
    <div class="logo-container">
      <img src="${esc(logoUrl)}" class="logo" alt="Logo" />
    </div>
  `
      : ""
  }

  <div class="c b">${esc(businessName || "Nombre del negocio")}</div>
  <div class="c">Cédula jurídica x-xxx-xxxxx</div>
  <div class="c">Dirección,</div>
  <div class="c">Tel 8888-8888</div>

  <hr>

  <div class="c b">TICKET</div>

  ${row("Consecutivo", "Pendiente")}
  ${row("Fecha de emisión", date)}
  ${row("Clave numérica", "Pendiente")}
  ${row("Condición de venta", "Contado")}

  <hr>

  ${row("Cliente", "Cliente de contado")}

  <hr>

  <div class="item item-header">
    <span>Producto</span>
    <span>Cant.</span>
    <span>P. unit.</span>
    <span>Total c/IVA</span>
  </div>

  ${receipt.lines
    .map(
      (line) => `
      <div class="item">
        <span>
          ${esc(line.detail)}
          <small class="rate">IVA ${formatRate(Number(line.ivaRate))}</small>
        </span>
        <span>${line.quantity}</span>
        <span>${
          Number(line.discount) > 0
            ? `<small class="old">${crc(line.unitPrice)}</small>${crc(Number(line.subtotal) / line.quantity)}`
            : crc(line.unitPrice)
        }</span>
        <span>${crc(line.total)}</span>
      </div>
    `,
    )
    .join("")}

  <hr>

  ${row("Subtotal (sin IVA)", crc(receipt.totals.totalNetSale))}

  ${receipt.taxSummary
    .map(({ rate, amount }) =>
      row(`IVA (${formatRate(rate)})`, crc(amount)),
    )
    .join("")}

  ${row("TOTAL", crc(receipt.totals.totalSale), "big")}

  <hr>

  ${row("Medio de pago", METHOD_LABELS[payment.method])}
  ${payment.reference ? row("Comprobante", payment.reference) : ""}
  ${payment.amountTendered ? row("Pagó con", crc(payment.amountTendered)) : ""}

  <!-- CAMBIO: mostrar cambio si el backend lo devuelve, incluso si es ₡0.00. -->
  ${payment.change !== null ? row("Cambio", crc(payment.change)) : ""}

  <div class="c" style="margin-top: 8px">
    ¡Gracias por su visita!
  </div>

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