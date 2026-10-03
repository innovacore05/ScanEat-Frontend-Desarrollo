import type { PayOrderResponse } from "./billingService";

const METHOD_LABELS: Record<
  PayOrderResponse["payment"]["method"],
  string
> = {
  cash: "Efectivo",
  card: "Tarjeta",
  sinpe: "SINPE Móvil",
};

const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c]!
  );

const crc = (v: string | number) =>
  `₡${Number(v).toLocaleString("es-CR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const row = (l: string, r: string, cls = "") =>
  `<div class="r ${cls}">
    <span>${esc(l)}</span>
    <span>${esc(r)}</span>
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

  const p = receipt.payment;

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
    grid-template-columns: 1fr auto;
    gap: 8px;
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
      <img
        src="${esc(logoUrl)}"
        class="logo"
        alt="Logo"
      />
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
  ${row("Fecha", date)}
  ${row("Mesa", `#${receipt.tableNumber}`)}
  ${row("Condición venta", "Contado")}
  ${row("Clave", "Pendiente")}

  <hr>

  ${row("Cliente", "Cliente de contado")}

  <hr>

  ${receipt.lines
    .map(
      (l) => `
      <div class="item">
        <span>${l.quantity} x ${esc(l.detail)}</span>
        <span>${crc(l.subtotal)}</span>
      </div>
    `
    )
    .join("")}

  <hr>

  ${row("Subtotal", crc(receipt.totals.totalNetSale))}
  ${row("IVA (13%)", crc(receipt.totals.totalTax))}
  ${row("TOTAL", crc(receipt.totals.totalSale), "big")}

  <hr>

  ${row("Medio de pago", METHOD_LABELS[p.method])}
  ${p.reference ? row("Comprobante", p.reference) : ""}
  ${p.amountTendered ? row("Pagó con", crc(p.amountTendered)) : ""}
  ${p.change ? row("Cambio", crc(p.change)) : ""}

  <div class="c" style="margin-top: 8px">
    ¡Gracias por su visita!
  </div>

</body>
</html>`;
}

export function printReceipt(
  receipt: PayOrderResponse,
  logoUrl: string | null,
  businessName:string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe");

    iframe.style.cssText =
      "position:fixed;width:0;height:0;border:0;visibility:hidden";

   iframe.srcdoc = buildHtml(receipt, logoUrl, businessName);

    const cleanup = () => setTimeout(() => iframe.remove(), 1000);

    iframe.onload = () => {
      try {
        const win = iframe.contentWindow!;

        win.onafterprint = () => {
          cleanup();
          resolve();
        };

        win.focus();
        win.print();
      } catch (e) {
        cleanup();
        reject(e);
      }
    };

    document.body.appendChild(iframe);
  });
}