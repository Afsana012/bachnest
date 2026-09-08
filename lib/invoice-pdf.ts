import { Invoice } from "./types";
import { formatDate, formatMoney, toNumber } from "./format";

interface InvoicePdfOptions {
  tenantName?: string;
  tenantPhone?: string;
  propertyTitle?: string;
  roomNumber?: string;
  ownerName?: string;
}

function escapePdfText(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export function generateInvoicePdfBlob(invoice: Invoice, options: InvoicePdfOptions = {}): Blob {
  const due = Math.max(0, toNumber(invoice.total_amount) - toNumber(invoice.paid_amount));
  const isPaid = invoice.status === "PAID" || due === 0;

  const lineItems: Array<{ label: string; amount: string }> = [
    { label: "Base Residential Rent", amount: formatMoney(invoice.base_rent) },
    { label: "Building Service & Security Charge", amount: formatMoney(invoice.service_charge) },
    { label: "Electricity Consumption Bill", amount: formatMoney(invoice.electricity_bill) },
    { label: "Water & Sewerage Supply Bill", amount: formatMoney(invoice.water_bill) },
    { label: "Gas Utility Supply Bill", amount: formatMoney(invoice.gas_bill) },
    { label: "High-Speed Shared Internet", amount: formatMoney(invoice.internet_bill) },
  ];

  if (toNumber(invoice.other_adjustments) !== 0) {
    lineItems.push({ label: "Special Adjustments / Credits", amount: formatMoney(invoice.other_adjustments) });
  }

  if (toNumber(invoice.late_fee) > 0) {
    lineItems.push({ label: "Late Payment Surcharge", amount: formatMoney(invoice.late_fee) });
  }

  const commands: string[] = [];

  // Background Header Accent Bar
  commands.push("0.05 0.58 0.43 rg"); // emerald-600
  commands.push("40 790 515 22 re f");

  commands.push("1 1 1 rg");
  commands.push("BT /F2 10 Tf 50 797 Td (BACHNEST HOUSING NETWORK - OFFICIAL RENT STATEMENT) Tj ET");

  // Main Header
  commands.push("0.1 0.1 0.15 rg");
  commands.push("BT /F2 20 Tf 40 755 Td (RENT INVOICE & VOUCHER) Tj ET");
  commands.push("0.4 0.45 0.5 rg");
  commands.push(`BT /F1 9 Tf 40 740 Td (Invoice Reference: #${escapePdfText(invoice.invoice_number)}) Tj ET`);
  commands.push(`BT /F1 9 Tf 40 727 Td (Generated: ${escapePdfText(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }))}) Tj ET`);

  // Status Stamp Box
  if (isPaid) {
    commands.push("0.85 0.95 0.90 rg");
    commands.push("415 730 140 34 re f");
    commands.push("0.05 0.58 0.43 RG 1.5 w");
    commands.push("415 730 140 34 re S");
    commands.push("0.05 0.58 0.43 rg");
    commands.push("BT /F2 12 Tf 435 745 Td (PAID & SETTLED) Tj ET");
    commands.push("BT /F1 8 Tf 435 735 Td (Official Receipt) Tj ET");
  } else {
    commands.push("0.99 0.95 0.88 rg");
    commands.push("415 730 140 34 re f");
    commands.push("0.85 0.55 0.1 RG 1.5 w");
    commands.push("415 730 140 34 re S");
    commands.push("0.85 0.55 0.1 rg");
    commands.push("BT /F2 12 Tf 438 745 Td (PAYMENT DUE) Tj ET");
    commands.push(`BT /F1 8 Tf 438 735 Td (Due: ${escapePdfText(formatDate(invoice.due_date))}) Tj ET`);
  }

  // Horizontal divider
  commands.push("0.85 0.88 0.92 RG 1 w");
  commands.push("40 710 m 555 710 l S");

  // Metadata Columns
  commands.push("0.15 0.2 0.25 rg");
  commands.push("BT /F2 10 Tf 40 690 Td (TENANCY & BILLING DETAILS) Tj ET");
  commands.push("0.35 0.4 0.45 rg");
  commands.push(`BT /F1 9 Tf 40 675 Td (Billing Month/Period: ${escapePdfText(invoice.billing_month_year)}) Tj ET`);
  commands.push(`BT /F1 9 Tf 40 660 Td (Payment Due Date: ${escapePdfText(formatDate(invoice.due_date))}) Tj ET`);
  commands.push(`BT /F1 9 Tf 40 645 Td (Tenancy Reference ID: ${escapePdfText(invoice.tenancy_id.slice(0, 16))}...) Tj ET`);

  if (options.propertyTitle || options.roomNumber) {
    commands.push("0.15 0.2 0.25 rg");
    commands.push("BT /F2 10 Tf 300 690 Td (PREMISES ALLOCATION) Tj ET");
    commands.push("0.35 0.4 0.45 rg");
    if (options.propertyTitle) {
      commands.push(`BT /F1 9 Tf 300 675 Td (Property: ${escapePdfText(options.propertyTitle)}) Tj ET`);
    }
    if (options.roomNumber) {
      commands.push(`BT /F1 9 Tf 300 660 Td (Room / Seat: ${escapePdfText(options.roomNumber)}) Tj ET`);
    }
    if (options.tenantName) {
      commands.push(`BT /F1 9 Tf 300 645 Td (Tenant: ${escapePdfText(options.tenantName)}) Tj ET`);
    }
  }

  // Table Header
  const tableTop = 615;
  commands.push("0.94 0.96 0.98 rg");
  commands.push(`40 ${tableTop - 22} 515 22 re f`);
  commands.push("0.8 0.84 0.88 RG 1 w");
  commands.push(`40 ${tableTop - 22} 515 22 re S`);

  commands.push("0.2 0.25 0.3 rg");
  commands.push(`BT /F2 9 Tf 50 ${tableTop - 15} Td (ITEMIZED CHARGES & PARTICULARS) Tj ET`);
  commands.push(`BT /F2 9 Tf 465 ${tableTop - 15} Td (AMOUNT (BDT)) Tj ET`);

  // Table Rows
  let currentY = tableTop - 22;
  const rowHeight = 22;

  lineItems.forEach((item, index) => {
    currentY -= rowHeight;
    if (index % 2 === 1) {
      commands.push("0.98 0.98 0.99 rg");
      commands.push(`40 ${currentY} 515 ${rowHeight} re f`);
    }
    commands.push("0.88 0.90 0.93 RG 0.5 w");
    commands.push(`40 ${currentY} m 555 ${currentY} l S`);

    commands.push("0.2 0.25 0.3 rg");
    commands.push(`BT /F1 9 Tf 50 ${currentY + 6} Td (${escapePdfText(item.label)}) Tj ET`);
    commands.push(`BT /F1 9 Tf 465 ${currentY + 6} Td (${escapePdfText(item.amount)}) Tj ET`);
  });

  // Table Border bottom
  commands.push("0.8 0.84 0.88 RG 1 w");
  commands.push(`40 ${currentY} 515 ${tableTop - currentY} re S`);

  // Summary Box
  const summaryTop = currentY - 20;
  commands.push("0.96 0.97 0.99 rg");
  commands.push(`300 ${summaryTop - 75} 255 75 re f`);
  commands.push("0.8 0.84 0.88 RG 1 w");
  commands.push(`300 ${summaryTop - 75} 255 75 re S`);

  commands.push("0.3 0.35 0.4 rg");
  commands.push(`BT /F1 9 Tf 315 ${summaryTop - 20} Td (Subtotal Gross Amount:) Tj ET`);
  commands.push(`BT /F1 9 Tf 470 ${summaryTop - 20} Td (${escapePdfText(formatMoney(invoice.total_amount))}) Tj ET`);

  commands.push("0.05 0.58 0.43 rg");
  commands.push(`BT /F1 9 Tf 315 ${summaryTop - 40} Td (Total Paid to Date:) Tj ET`);
  commands.push(`BT /F1 9 Tf 470 ${summaryTop - 40} Td (- ${escapePdfText(formatMoney(invoice.paid_amount))}) Tj ET`);

  commands.push("0.8 0.84 0.88 RG 0.5 w");
  commands.push(`310 ${summaryTop - 48} m 545 ${summaryTop - 48} l S`);

  commands.push("0.1 0.15 0.2 rg");
  commands.push(`BT /F2 11 Tf 315 ${summaryTop - 65} Td (Net Balance Due:) Tj ET`);
  if (due > 0) {
    commands.push("0.85 0.2 0.2 rg");
  } else {
    commands.push("0.05 0.58 0.43 rg");
  }
  commands.push(`BT /F2 11 Tf 470 ${summaryTop - 65} Td (${escapePdfText(formatMoney(due))}) Tj ET`);

  // Signatures & Stamp section
  commands.push("0.85 0.88 0.92 RG 1 w");
  commands.push("40 180 m 220 180 l S");
  commands.push("0.4 0.45 0.5 rg");
  commands.push("BT /F1 8 Tf 40 165 Td (Landlord / Authorized Representative) Tj ET");
  commands.push("BT /F1 7 Tf 40 153 Td (BachNest Housing Management System) Tj ET");

  commands.push("0.85 0.88 0.92 RG 1 w");
  commands.push("375 180 m 555 180 l S");
  commands.push("0.4 0.45 0.5 rg");
  commands.push("BT /F1 8 Tf 375 165 Td (Tenant Acknowledgment & Signature) Tj ET");
  commands.push("BT /F1 7 Tf 375 153 Td (Verified Digital Tenancy Record) Tj ET");

  // Footer Disclaimer
  commands.push("0.55 0.6 0.65 rg");
  commands.push("BT /F1 7.5 Tf 40 70 Td (Notice: This document is an officially generated electronic invoice from BachNest Platform.) Tj ET");
  commands.push("BT /F1 7.5 Tf 40 58 Td (Valid for tax deduction, company allowances, and Dhaka Metropolitan Police tenant record filing.) Tj ET");
  commands.push("BT /F1 7.5 Tf 40 46 Td (Support: support@bachnest.com  |  Dhaka, Bangladesh  |  https://bachnest.com) Tj ET");

  const streamContent = commands.join("\n");
  const streamLength = streamContent.length;

  const pdfObjects: string[] = [
    // 1: Catalog
    "<< /Type /Catalog /Pages 2 0 R >>",
    // 2: Pages
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    // 3: Page (A4: 595.28 x 841.89 pt)
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    // 4: Font F1 (Helvetica)
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    // 5: Font F2 (Helvetica-Bold)
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    // 6: Content Stream
    `<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream`,
  ];

  let output = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const xrefOffsets: number[] = [0];

  pdfObjects.forEach((obj, index) => {
    xrefOffsets.push(output.length);
    output += `${index + 1} 0 obj\n${obj}\nendobj\n`;
  });

  const startXref = output.length;
  output += `xref\n0 ${pdfObjects.length + 1}\n`;
  output += "0000000000 65535 f \n";

  for (let i = 1; i <= pdfObjects.length; i++) {
    const offsetStr = String(xrefOffsets[i]).padStart(10, "0");
    output += `${offsetStr} 00000 n \n`;
  }

  output += `trailer\n<< /Size ${pdfObjects.length + 1} /Root 1 0 R >>\n`;
  output += `startxref\n${startXref}\n%%EOF\n`;

  const bytes = new Uint8Array(output.length);
  for (let i = 0; i < output.length; i++) {
    bytes[i] = output.charCodeAt(i) & 0xff;
  }

  return new Blob([bytes], { type: "application/pdf" });
}

export function downloadInvoicePdf(invoice: Invoice, options: InvoicePdfOptions = {}): void {
  const blob = generateInvoicePdfBlob(invoice, options);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `BachNest-Invoice-${invoice.invoice_number}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
