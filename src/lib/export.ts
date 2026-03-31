import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Client, CompanySettings, Contract, Equipment, Kit, Quote, Reservation } from "@/data/mock-data";
import { formatCurrency, formatDate } from "@/lib/format";

interface QuoteExportContext {
  quote: Quote;
  settings: CompanySettings;
  client?: Client;
  equipment?: Equipment[];
  kits?: Kit[];
}

const escapePdfText = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const downloadBlob = (filename: string, blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const createSimplePdf = (title: string, lines: string[]) => {
  const lineHeight = 16;
  const textCommands = [
    "BT",
    "/F1 18 Tf",
    "50 790 Td",
    `(${escapePdfText(title)}) Tj`,
    "/F1 11 Tf",
    ...lines.flatMap((line, index) => {
      const y = 760 - index * lineHeight;
      return [`1 0 0 1 50 ${y} Tm`, `(${escapePdfText(line)}) Tj`];
    }),
    "ET",
  ].join("\n");

  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${textCommands.length} >> stream\n${textCommands}\nendstream endobj`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
};

const money = (value: number) => formatCurrency(Number.isFinite(value) ? value : 0);

const safeText = (value: string | undefined, fallback: string) => {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const resolveItemCategory = (itemId: string, type: "equipment" | "kit", equipment: Equipment[], kits: Kit[]) => {
  if (type === "kit") {
    return "Kit";
  }

  return equipment.find((entry) => entry.id === itemId)?.category ?? "Equipamento";
};

const buildQuoteDocument = ({ quote, settings, client, equipment = [], kits = [] }: QuoteExportContext) => {
  const enrichedItems = quote.items.map((item) => ({
    ...item,
    category: resolveItemCategory(item.refId, item.type, equipment, kits),
    subtotal: item.quantity * item.dailyRate * item.days,
  }));

  const subtotal = enrichedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const total = Number.isFinite(quote.total) ? quote.total : Math.max(0, subtotal - quote.discount);
  const company = {
    name: safeText(settings.companyName, "RentFlow"),
    cnpj: safeText(settings.cnpj, "CNPJ não informado"),
    phone: safeText(settings.phone, "Telefone não informado"),
    email: safeText(settings.email, "Email não informado"),
    address: safeText(settings.address, "Endereço não informado"),
    logoUrl: settings.logoUrl?.trim() || "",
  };
  const customer = {
    displayName: safeText(client?.contactName || quote.clientName, "Cliente não informado"),
    companyName: safeText(client?.tradeName || client?.legalName || client?.company, "Empresa não informada"),
    document: safeText(client?.document, "Documento não informado"),
    phone: safeText(client?.phone, "Telefone não informado"),
    email: safeText(client?.email, "Email não informado"),
  };
  const meta = {
    quoteId: safeText(quote.id, "ORC-SEM-ID"),
    createdAt: safeText(formatDate(quote.createdAt), "Data não informada"),
    validUntil: safeText(formatDate(quote.validUntil), "Validade não informada"),
    rentalPeriod: `${safeText(formatDate(quote.rentalStartDate), "Início não informado")} até ${safeText(formatDate(quote.rentalEndDate), "Fim não informado")}`,
    status: safeText(quote.status, "draft"),
    notes: safeText(quote.notes, "Sem observações adicionais."),
  };

  return {
    company,
    customer,
    meta,
    items: enrichedItems.length
      ? enrichedItems
      : [
          {
            id: "fallback",
            name: "Nenhum item adicionado",
            category: "Sem itens",
            quantity: 0,
            days: 0,
            dailyRate: 0,
            subtotal: 0,
          },
        ],
    financial: {
      subtotal,
      discount: quote.discount || 0,
      total,
    },
  };
};

const loadImageAsDataUrl = async (url: string) => {
  if (!url) return null;

  return new Promise<string | null>((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d");
        if (!context) {
          resolve(null);
          return;
        }
        context.drawImage(image, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(null);
      }
    };
    image.onerror = () => resolve(null);
    image.src = url;
  });
};

const buildQuoteHtml = (context: QuoteExportContext) => {
  const documentData = buildQuoteDocument(context);
  const logoMarkup = documentData.company.logoUrl
    ? `<img class="brand-logo" src="${escapeHtml(documentData.company.logoUrl)}" alt="Logo da locadora" />`
    : `<div class="brand-badge">CG</div>`;

  return `
    <html>
      <head>
        <title>Orçamento ${escapeHtml(documentData.meta.quoteId)}</title>
        <style>
          :root {
            color-scheme: light;
            --paper: #ffffff;
            --ink: #151821;
            --muted: #667085;
            --line: #d8dce8;
            --accent: #c99d2d;
            --accent-soft: rgba(201, 157, 45, 0.12);
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: #eef1f7;
            color: var(--ink);
            font-family: "Segoe UI", Inter, Arial, sans-serif;
            padding: 24px;
          }
          .sheet {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: var(--paper);
            border-radius: 24px;
            padding: 24mm 18mm 18mm;
            box-shadow: 0 22px 80px rgba(17, 24, 39, 0.14);
          }
          .header {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            align-items: flex-start;
            border-bottom: 1px solid var(--line);
            padding-bottom: 18px;
          }
          .brand {
            display: flex;
            gap: 14px;
            align-items: center;
          }
          .brand-logo {
            width: 72px;
            height: 72px;
            object-fit: contain;
            border-radius: 18px;
            background: #fff;
            border: 1px solid var(--line);
            padding: 8px;
          }
          .brand-badge {
            width: 72px;
            height: 72px;
            border-radius: 18px;
            background: linear-gradient(135deg, #d8af45 0%, #8b6520 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            letter-spacing: 0.12em;
          }
          .title {
            font-size: 28px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            margin: 0 0 8px;
          }
          .muted { color: var(--muted); }
          .meta-pill {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            border-radius: 999px;
            background: var(--accent-soft);
            color: #755512;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
            margin-top: 22px;
          }
          .card {
            border: 1px solid var(--line);
            border-radius: 18px;
            padding: 16px;
            background: #fbfcfe;
          }
          .card h3 {
            margin: 0 0 10px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--muted);
          }
          .line {
            margin: 0 0 6px;
            font-size: 14px;
            line-height: 1.45;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 22px;
            font-size: 13px;
          }
          thead th {
            text-align: left;
            padding: 12px 10px;
            background: #f7f8fb;
            border-bottom: 1px solid var(--line);
            color: var(--muted);
            text-transform: uppercase;
            letter-spacing: 0.06em;
            font-size: 11px;
          }
          tbody td {
            padding: 12px 10px;
            border-bottom: 1px solid var(--line);
            vertical-align: top;
          }
          .right { text-align: right; }
          .summary {
            margin-top: 20px;
            margin-left: auto;
            width: 320px;
            border: 1px solid var(--line);
            border-radius: 18px;
            padding: 16px;
            background: #fbfcfe;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            margin: 0 0 10px;
            font-size: 14px;
          }
          .summary-row.total {
            margin-top: 14px;
            padding-top: 14px;
            border-top: 1px solid var(--line);
            font-size: 18px;
            font-weight: 700;
          }
          .notes {
            margin-top: 20px;
            border: 1px solid var(--line);
            border-radius: 18px;
            padding: 16px;
            background: #fbfcfe;
          }
          .footer {
            margin-top: 24px;
            padding-top: 14px;
            border-top: 1px solid var(--line);
            color: var(--muted);
            font-size: 12px;
            line-height: 1.5;
          }
          @page {
            size: A4;
            margin: 14mm;
          }
          @media print {
            body {
              background: white;
              padding: 0;
            }
            .sheet {
              width: auto;
              min-height: auto;
              margin: 0;
              box-shadow: none;
              border-radius: 0;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="header">
            <div class="brand">
              ${logoMarkup}
              <div>
                <p class="title">Orçamento</p>
                <p class="line"><strong>${escapeHtml(documentData.company.name)}</strong></p>
                <p class="line muted">CNPJ ${escapeHtml(documentData.company.cnpj)}</p>
                <p class="line muted">${escapeHtml(documentData.company.phone)} • ${escapeHtml(documentData.company.email)}</p>
                <p class="line muted">${escapeHtml(documentData.company.address)}</p>
              </div>
            </div>
            <div style="text-align:right">
              <div class="meta-pill">${escapeHtml(documentData.meta.status)}</div>
              <p class="line" style="margin-top:14px"><strong>${escapeHtml(documentData.meta.quoteId)}</strong></p>
              <p class="line muted">Emissão: ${escapeHtml(documentData.meta.createdAt)}</p>
              <p class="line muted">Validade: ${escapeHtml(documentData.meta.validUntil)}</p>
            </div>
          </div>

          <div class="grid">
            <div class="card">
              <h3>Cliente</h3>
              <p class="line"><strong>${escapeHtml(documentData.customer.displayName)}</strong></p>
              <p class="line">${escapeHtml(documentData.customer.companyName)}</p>
              <p class="line muted">${escapeHtml(documentData.customer.document)}</p>
              <p class="line muted">${escapeHtml(documentData.customer.phone)}</p>
              <p class="line muted">${escapeHtml(documentData.customer.email)}</p>
            </div>
            <div class="card">
              <h3>Dados do orçamento</h3>
              <p class="line"><strong>Período:</strong> ${escapeHtml(documentData.meta.rentalPeriod)}</p>
              <p class="line"><strong>Status:</strong> ${escapeHtml(documentData.meta.status)}</p>
              <p class="line"><strong>Itens:</strong> ${documentData.items.length}</p>
              <p class="line"><strong>Total:</strong> ${escapeHtml(money(documentData.financial.total))}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Categoria</th>
                <th class="right">Qtd</th>
                <th class="right">Diárias</th>
                <th class="right">Valor unitário</th>
                <th class="right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${documentData.items
                .map(
                  (item) => `
                    <tr>
                      <td>${escapeHtml(item.name)}</td>
                      <td>${escapeHtml(item.category)}</td>
                      <td class="right">${item.quantity}</td>
                      <td class="right">${item.days}</td>
                      <td class="right">${escapeHtml(money(item.dailyRate))}</td>
                      <td class="right">${escapeHtml(money(item.subtotal))}</td>
                    </tr>
                  `,
                )
                .join("")}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-row"><span>Subtotal</span><strong>${escapeHtml(money(documentData.financial.subtotal))}</strong></div>
            <div class="summary-row"><span>Desconto</span><strong>${escapeHtml(money(documentData.financial.discount))}</strong></div>
            <div class="summary-row total"><span>Total final</span><span>${escapeHtml(money(documentData.financial.total))}</span></div>
          </div>

          <div class="notes">
            <h3>Observações</h3>
            <p class="line">${escapeHtml(documentData.meta.notes)}</p>
          </div>

          <div class="footer">
            Este orçamento foi gerado pelo RentFlow. Valores sujeitos à disponibilidade de itens na retirada.
            Em caso de dúvidas, responda para ${escapeHtml(documentData.company.email)} ou ligue para ${escapeHtml(documentData.company.phone)}.
          </div>
        </div>
      </body>
    </html>
  `;
};

const openDocumentWindow = (title: string, html: string, mode: "preview" | "print") => {
  const documentWindow = window.open("", "_blank", "width=1100,height=900");
  if (!documentWindow) return null;

  documentWindow.document.write(html);
  documentWindow.document.close();
  documentWindow.document.title = title;

  if (mode === "print") {
    documentWindow.onload = () => {
      documentWindow.focus();
      documentWindow.print();
    };
  }

  return documentWindow;
};

export const previewQuoteDocument = (context: QuoteExportContext) => {
  const html = buildQuoteHtml(context);
  return openDocumentWindow(`Prévia ${context.quote.id}`, html, "preview");
};

export const printQuote = (context: QuoteExportContext) => {
  const html = buildQuoteHtml(context);
  return openDocumentWindow(`Impressão ${context.quote.id}`, html, "print");
};

export const downloadQuotePdf = async (context: QuoteExportContext) => {
  const documentData = buildQuoteDocument(context);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 42;
  let cursorY = margin;

  doc.setFillColor(250, 250, 252);
  doc.roundedRect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2, 18, 18, "F");

  const logoDataUrl = await loadImageAsDataUrl(documentData.company.logoUrl);
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", margin + 8, cursorY + 4, 52, 52);
  } else {
    doc.setFillColor(201, 157, 45);
    doc.roundedRect(margin + 8, cursorY + 4, 52, 52, 10, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("CG", margin + 34, cursorY + 37, { align: "center" });
  }

  doc.setTextColor(22, 24, 29);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("ORÇAMENTO", margin + 72, cursorY + 18);
  doc.setFontSize(13);
  doc.text(documentData.company.name, margin + 72, cursorY + 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 110, 125);
  doc.text(`CNPJ ${documentData.company.cnpj}`, margin + 72, cursorY + 57);
  doc.text(`${documentData.company.phone} • ${documentData.company.email}`, margin + 72, cursorY + 72);
  doc.text(documentData.company.address, margin + 72, cursorY + 87, { maxWidth: 260 });

  doc.setFillColor(248, 241, 221);
  doc.roundedRect(pageWidth - margin - 150, cursorY + 6, 142, 28, 12, 12, "F");
  doc.setTextColor(117, 85, 18);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(documentData.meta.status.toUpperCase(), pageWidth - margin - 79, cursorY + 24, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setTextColor(22, 24, 29);
  doc.setFontSize(12);
  doc.text(documentData.meta.quoteId, pageWidth - margin - 8, cursorY + 56, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 110, 125);
  doc.text(`Emissão: ${documentData.meta.createdAt}`, pageWidth - margin - 8, cursorY + 73, { align: "right" });
  doc.text(`Validade: ${documentData.meta.validUntil}`, pageWidth - margin - 8, cursorY + 88, { align: "right" });

  cursorY += 118;

  const boxWidth = (pageWidth - margin * 2 - 12) / 2;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(221, 225, 232);
  doc.roundedRect(margin, cursorY, boxWidth, 100, 14, 14, "FD");
  doc.roundedRect(margin + boxWidth + 12, cursorY, boxWidth, 100, 14, 14, "FD");

  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 110, 125);
  doc.setFontSize(10);
  doc.text("CLIENTE", margin + 16, cursorY + 20);
  doc.text("DADOS DO ORÇAMENTO", margin + boxWidth + 28, cursorY + 20);

  doc.setTextColor(22, 24, 29);
  doc.setFontSize(12);
  doc.text(documentData.customer.displayName, margin + 16, cursorY + 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const customerLines = [
    documentData.customer.companyName,
    documentData.customer.document,
    documentData.customer.phone,
    documentData.customer.email,
  ];
  customerLines.forEach((line, index) => {
    doc.text(line, margin + 16, cursorY + 58 + index * 14, { maxWidth: boxWidth - 28 });
  });

  doc.setTextColor(22, 24, 29);
  doc.text(`Período: ${documentData.meta.rentalPeriod}`, margin + boxWidth + 28, cursorY + 40, { maxWidth: boxWidth - 28 });
  doc.text(`Status: ${documentData.meta.status}`, margin + boxWidth + 28, cursorY + 58);
  doc.text(`Itens: ${documentData.items.length}`, margin + boxWidth + 28, cursorY + 72);
  doc.setFont("helvetica", "bold");
  doc.text(`Total: ${money(documentData.financial.total)}`, margin + boxWidth + 28, cursorY + 90);

  cursorY += 124;

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    head: [["Item", "Categoria", "Qtd", "Diárias", "Valor unitário", "Subtotal"]],
    body: documentData.items.map((item) => [
      item.name,
      item.category,
      String(item.quantity),
      String(item.days),
      money(item.dailyRate),
      money(item.subtotal),
    ]),
    theme: "grid",
    headStyles: {
      fillColor: [247, 248, 251],
      textColor: [100, 110, 125],
      fontStyle: "bold",
      lineColor: [221, 225, 232],
      lineWidth: 1,
    },
    bodyStyles: {
      textColor: [22, 24, 29],
      lineColor: [221, 225, 232],
      lineWidth: 0.6,
      fontSize: 10,
      cellPadding: 8,
      overflow: "linebreak",
    },
    columnStyles: {
      0: { cellWidth: 165 },
      1: { cellWidth: 90 },
      2: { halign: "right", cellWidth: 42 },
      3: { halign: "right", cellWidth: 54 },
      4: { halign: "right", cellWidth: 92 },
      5: { halign: "right", cellWidth: 88 },
    },
    alternateRowStyles: {
      fillColor: [252, 252, 253],
    },
    didDrawPage: (data) => {
      doc.setFontSize(9);
      doc.setTextColor(140, 145, 158);
      doc.text(
        `Gerado por RentFlow • Página ${data.pageNumber}`,
        pageWidth - margin,
        pageHeight - 22,
        { align: "right" },
      );
    },
  });

  cursorY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? cursorY + 200;

  const summaryY = cursorY + 18;
  const summaryX = pageWidth - margin - 220;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(summaryX, summaryY, 220, 86, 14, 14, "FD");
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 110, 125);
  doc.setFontSize(10);
  doc.text("Subtotal", summaryX + 16, summaryY + 24);
  doc.text(money(documentData.financial.subtotal), summaryX + 204, summaryY + 24, { align: "right" });
  doc.text("Desconto", summaryX + 16, summaryY + 44);
  doc.text(money(documentData.financial.discount), summaryX + 204, summaryY + 44, { align: "right" });
  doc.setDrawColor(221, 225, 232);
  doc.line(summaryX + 16, summaryY + 56, summaryX + 204, summaryY + 56);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(22, 24, 29);
  doc.setFontSize(14);
  doc.text("Total final", summaryX + 16, summaryY + 77);
  doc.text(money(documentData.financial.total), summaryX + 204, summaryY + 77, { align: "right" });

  const notesY = summaryY + 108;
  if (notesY > pageHeight - 120) {
    doc.addPage();
    cursorY = margin;
  } else {
    cursorY = notesY;
  }

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, cursorY, pageWidth - margin * 2, 90, 14, 14, "FD");
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 110, 125);
  doc.setFontSize(10);
  doc.text("OBSERVAÇÕES", margin + 16, cursorY + 20);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(22, 24, 29);
  doc.setFontSize(10);
  const noteLines = doc.splitTextToSize(documentData.meta.notes, pageWidth - margin * 2 - 32);
  doc.text(noteLines, margin + 16, cursorY + 40);

  doc.save(`${documentData.meta.quoteId}.pdf`);
};

export const downloadContractPdf = (contract: Contract, reservation: Reservation | undefined, settings: CompanySettings) => {
  const lines = [
    `${settings.companyName} | CNPJ ${settings.cnpj}`,
    `${settings.phone} | ${settings.email}`,
    settings.address,
    "",
    `Contrato ${contract.id}`,
    `Cliente: ${contract.clientName}`,
    `Reserva vinculada: ${contract.reservationId}`,
    `Data de emissão: ${formatDate(contract.createdAt)}`,
    reservation ? `Período: ${formatDate(reservation.pickupDate)} a ${formatDate(reservation.returnDate)}` : "Período: não informado",
    `Valor: ${formatCurrency(contract.value)}`,
    "",
    contract.content,
  ];

  downloadBlob(`${contract.id}.pdf`, createSimplePdf(`Contrato ${contract.id}`, lines));
};

export const printContract = (contract: Contract, reservation: Reservation | undefined, settings: CompanySettings) => {
  const printWindow = openDocumentWindow(
    `Contrato ${contract.id}`,
    `
      <html>
        <head><title>Contrato ${contract.id}</title></head>
        <body style="font-family:Segoe UI,Arial,sans-serif;padding:32px;color:#16181d">
          <h1>${escapeHtml(settings.companyName)}</h1>
          <p>${escapeHtml(settings.cnpj)} • ${escapeHtml(settings.phone)} • ${escapeHtml(settings.email)}</p>
          <p>${escapeHtml(settings.address)}</p>
          <h2>Contrato ${escapeHtml(contract.id)}</h2>
          <p>Cliente: ${escapeHtml(contract.clientName)}</p>
          <p>Reserva: ${escapeHtml(contract.reservationId)}</p>
          <p>Emissão: ${escapeHtml(formatDate(contract.createdAt))}</p>
          <p>Valor: ${escapeHtml(formatCurrency(contract.value))}</p>
          <p>${reservation ? escapeHtml(`Período: ${formatDate(reservation.pickupDate)} a ${formatDate(reservation.returnDate)}`) : ""}</p>
          <p>${escapeHtml(contract.content)}</p>
        </body>
      </html>
    `,
    "print",
  );

  return printWindow;
};

export const downloadCsv = (filename: string, headers: string[], rows: Array<Array<string | number>>) => {
  const csv = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");
  downloadBlob(filename, new Blob([csv], { type: "text/csv;charset=utf-8;" }));
};
