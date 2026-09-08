import { DepositClaimOut, DepositDeductionItem } from "./types";
import { formatDate, formatMoney } from "./format";

function escapePdfText(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export function generateDepositClearancePdfBlob(claim: DepositClaimOut): Blob {
  const isSettled = claim.status === "SETTLED";
  const commands: string[] = [];

  // Background Header Accent Bar
  commands.push("0.1 0.25 0.5 rg"); // Navy blue
  commands.push("40 790 515 22 re f");

  commands.push("1 1 1 rg");
  commands.push("BT /F2 10 Tf 50 797 Td (BACHNEST PLATFORM - MOVE-OUT & DEPOSIT CLEARANCE) Tj ET");

  // Main Header
  commands.push("0.1 0.1 0.15 rg");
  commands.push("BT /F2 19 Tf 40 755 Td (SECURITY DEPOSIT SETTLEMENT VOUCHER) Tj ET");
  commands.push("0.4 0.45 0.5 rg");
  commands.push(`BT /F1 9 Tf 40 740 Td (Clearance Certificate Ref: #${escapePdfText(claim.id.slice(0, 16).toUpperCase())}) Tj ET`);
  commands.push(`BT /F1 9 Tf 40 727 Td (Handover Date: ${escapePdfText(formatDate(claim.move_out_date))}) Tj ET`);

  // Status Stamp Box
  if (isSettled) {
    commands.push("0.85 0.95 0.90 rg");
    commands.push("405 730 150 34 re f");
    commands.push("0.05 0.58 0.43 RG 1.5 w");
    commands.push("405 730 150 34 re S");
    commands.push("0.05 0.58 0.43 rg");
    commands.push("BT /F2 11 Tf 420 746 Td (SETTLED & DISCHARGED) Tj ET");
    commands.push("BT /F1 8 Tf 420 735 Td (Zero Claims Remaining) Tj ET");
  } else {
    commands.push("0.99 0.95 0.88 rg");
    commands.push("405 730 150 34 re f");
    commands.push("0.85 0.55 0.1 RG 1.5 w");
    commands.push("405 730 150 34 re S");
    commands.push("0.85 0.55 0.1 rg");
    commands.push(`BT /F2 11 Tf 425 746 Td (${escapePdfText(claim.status)}) Tj ET`);
    commands.push("BT /F1 8 Tf 425 735 Td (Inspection Underway) Tj ET");
  }

  // Horizontal divider
  commands.push("0.85 0.88 0.92 RG 1 w");
  commands.push("40 710 m 555 710 l S");

  // Parties & Property Particulars
  commands.push("0.15 0.2 0.25 rg");
  commands.push("BT /F2 10 Tf 40 690 Td (TENANT PARTICULARS) Tj ET");
  commands.push("0.35 0.4 0.45 rg");
  commands.push(`BT /F1 9 Tf 40 675 Td (Tenant Name: ${escapePdfText(claim.tenant_name || "Verified Tenant")}) Tj ET`);
  commands.push(`BT /F1 9 Tf 40 660 Td (Payout Channel: ${escapePdfText(claim.tenant_payout_method)} - ${escapePdfText(claim.tenant_payout_account)}) Tj ET`);
  if (claim.transaction_reference) {
    commands.push(`BT /F1 9 Tf 40 645 Td (Settlement Trx Ref: ${escapePdfText(claim.transaction_reference)}) Tj ET`);
  }

  commands.push("0.15 0.2 0.25 rg");
  commands.push("BT /F2 10 Tf 300 690 Td (PREMISES & HANDOVER DETAILS) Tj ET");
  commands.push("0.35 0.4 0.45 rg");
  commands.push(`BT /F1 9 Tf 300 675 Td (Property: ${escapePdfText(claim.property_title || "BachNest Residence")}) Tj ET`);
  commands.push(`BT /F1 9 Tf 300 660 Td (Room / Space: ${escapePdfText(claim.room_name || "Allotted Unit")}) Tj ET`);
  commands.push(`BT /F1 9 Tf 300 645 Td (Landlord: ${escapePdfText(claim.owner_name || "Property Host")}) Tj ET`);

  // Financial Table
  const tableTop = 615;
  commands.push("0.94 0.96 0.98 rg");
  commands.push(`40 ${tableTop - 22} 515 22 re f`);
  commands.push("0.8 0.84 0.88 RG 1 w");
  commands.push(`40 ${tableTop - 22} 515 22 re S`);

  commands.push("0.2 0.25 0.3 rg");
  commands.push(`BT /F2 9 Tf 50 ${tableTop - 15} Td (DEPOSIT SETTLEMENT PARTICULARS & INSPECTION DEDUCTIONS) Tj ET`);
  commands.push(`BT /F2 9 Tf 465 ${tableTop - 15} Td (AMOUNT (BDT)) Tj ET`);

  let currentY = tableTop - 22;
  const rowHeight = 22;

  // Row 1: Original Deposit
  currentY -= rowHeight;
  commands.push("0.88 0.90 0.93 RG 0.5 w");
  commands.push(`40 ${currentY} m 555 ${currentY} l S`);
  commands.push("0.1 0.15 0.2 rg");
  commands.push(`BT /F2 9 Tf 50 ${currentY + 6} Td (Original Security Deposit Paid Upon Move-In) Tj ET`);
  commands.push(`BT /F2 9 Tf 465 ${currentY + 6} Td (${escapePdfText(formatMoney(claim.total_deposit_amount))}) Tj ET`);

  // Deduction rows
  const deductions = claim.deduction_breakdown || [];
  if (deductions.length > 0) {
    deductions.forEach((d: DepositDeductionItem, i: number) => {
      currentY -= rowHeight;
      if (i % 2 === 1) {
        commands.push("0.98 0.98 0.99 rg");
        commands.push(`40 ${currentY} 515 ${rowHeight} re f`);
      }
      commands.push("0.88 0.90 0.93 RG 0.5 w");
      commands.push(`40 ${currentY} m 555 ${currentY} l S`);

      commands.push("0.7 0.2 0.2 rg");
      const reasonLabel = `Less: ${d.reason || "Inspection Repair / Arrears"}`;
      commands.push(`BT /F1 9 Tf 50 ${currentY + 6} Td (${escapePdfText(reasonLabel)}) Tj ET`);
      commands.push(`BT /F1 9 Tf 465 ${currentY + 6} Td (- ${escapePdfText(formatMoney(d.amount))}) Tj ET`);
    });
  } else {
    currentY -= rowHeight;
    commands.push("0.88 0.90 0.93 RG 0.5 w");
    commands.push(`40 ${currentY} m 555 ${currentY} l S`);
    commands.push("0.05 0.58 0.43 rg");
    commands.push(`BT /F1 9 Tf 50 ${currentY + 6} Td (No Damage or Arrears Deductions Applied - Full Clearance) Tj ET`);
    commands.push(`BT /F1 9 Tf 465 ${currentY + 6} Td (0.00) Tj ET`);
  }

  // Border bottom
  commands.push("0.8 0.84 0.88 RG 1 w");
  commands.push(`40 ${currentY} 515 ${tableTop - currentY} re S`);

  // Summary box
  const summaryTop = currentY - 20;
  commands.push("0.96 0.97 0.99 rg");
  commands.push(`300 ${summaryTop - 75} 255 75 re f`);
  commands.push("0.8 0.84 0.88 RG 1 w");
  commands.push(`300 ${summaryTop - 75} 255 75 re S`);

  commands.push("0.3 0.35 0.4 rg");
  commands.push(`BT /F1 9 Tf 315 ${summaryTop - 20} Td (Total Security Deposit:) Tj ET`);
  commands.push(`BT /F1 9 Tf 470 ${summaryTop - 20} Td (${escapePdfText(formatMoney(claim.total_deposit_amount))}) Tj ET`);

  commands.push("0.7 0.2 0.2 rg");
  commands.push(`BT /F1 9 Tf 315 ${summaryTop - 40} Td (Total Deductions Applied:) Tj ET`);
  commands.push(`BT /F1 9 Tf 470 ${summaryTop - 40} Td (- ${escapePdfText(formatMoney(claim.deduction_amount))}) Tj ET`);

  commands.push("0.8 0.84 0.88 RG 0.5 w");
  commands.push(`310 ${summaryTop - 48} m 545 ${summaryTop - 48} l S`);

  commands.push("0.05 0.58 0.43 rg");
  commands.push(`BT /F2 11 Tf 315 ${summaryTop - 65} Td (Net Refund Transferred:) Tj ET`);
  commands.push(`BT /F2 11 Tf 470 ${summaryTop - 65} Td (${escapePdfText(formatMoney(claim.net_refund_amount))}) Tj ET`);

  // Signatures section
  commands.push("0.85 0.88 0.92 RG 1 w");
  commands.push("40 180 m 220 180 l S");
  commands.push("0.4 0.45 0.5 rg");
  commands.push("BT /F1 8 Tf 40 165 Td (Landlord Inspection Sign-off) Tj ET");
  commands.push("BT /F1 7 Tf 40 153 Td (Key Handover & Property Clearance Confirmed) Tj ET");

  commands.push("0.85 0.88 0.92 RG 1 w");
  commands.push("375 180 m 555 180 l S");
  commands.push("0.4 0.45 0.5 rg");
  commands.push("BT /F1 8 Tf 375 165 Td (Tenant Final Acknowledgment) Tj ET");
  commands.push("BT /F1 7 Tf 375 153 Td (Net Deposit Refund Received & Settled) Tj ET");

  // Footer Disclaimer
  commands.push("0.55 0.6 0.65 rg");
  commands.push("BT /F1 7.5 Tf 40 70 Td (Official Clearance Certificate generated by BachNest Housing Platform.) Tj ET");
  commands.push("BT /F1 7.5 Tf 40 58 Td (Valid as proof of full settlement under Dhaka Metropolitan Police tenant guidelines.) Tj ET");
  commands.push("BT /F1 7.5 Tf 40 46 Td (Support: support@bachnest.com  |  Dhaka, Bangladesh) Tj ET");

  const streamContent = commands.join("\n");
  const streamLength = streamContent.length;

  const pdfObjects: string[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
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

export function downloadDepositClearancePdf(claim: DepositClaimOut): void {
  const blob = generateDepositClearancePdfBlob(claim);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `BachNest-Deposit-Clearance-${claim.id.slice(0, 8)}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
