import { DMPFormData } from "./types";
import { formatDate, formatMoney } from "./format";

function escapePdfText(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export function generateDmpPolicePdfBlob(data: DMPFormData): Blob {
  const commands: string[] = [];

  // Top National Accent Bar
  commands.push("0.05 0.35 0.22 rg"); // Deep Forest Green (Bangladesh Police/DMP Theme)
  commands.push("40 792 515 22 re f");

  commands.push("1 1 1 rg");
  commands.push("BT /F2 10 Tf 50 799 Td (DHAKA METROPOLITAN POLICE - CITIZEN INFORMATION MANAGEMENT SYSTEM) Tj ET");

  // Main DMP Form Title
  commands.push("0.1 0.15 0.2 rg");
  commands.push("BT /F2 16 Tf 40 762 Td (TENANT VERIFICATION FORM) Tj ET");
  commands.push("0.3 0.35 0.4 rg");
  commands.push("BT /F1 9 Tf 40 748 Td (Standard DMP Form for Residential Renters, Students and Bachelors) Tj ET");
  commands.push(`BT /F1 9 Tf 40 735 Td (Form Tracking Ref: #DMP-BN-${escapePdfText(data.tenancy_id.slice(0, 10).toUpperCase())}) Tj ET`);

  // Passport Size Photo Box (Top Right)
  commands.push("0.85 0.88 0.92 RG 1 w");
  commands.push("0.96 0.97 0.98 rg");
  commands.push("445 685 110 95 re f");
  commands.push("445 685 110 95 re S");
  commands.push("0.45 0.5 0.55 rg");
  commands.push("BT /F2 8 Tf 462 740 Td (AFFIX PASSPORT) Tj ET");
  commands.push("BT /F2 8 Tf 462 728 Td (SIZE PHOTO HERE) Tj ET");
  commands.push("BT /F1 7 Tf 455 705 Td ((1.5 x 1.5 Inch Size)) Tj ET");

  // Horizontal divider
  commands.push("0.8 0.84 0.88 RG 1 w");
  commands.push("40 720 m 430 720 l S");

  // Section 1: Tenant Information Header
  let currentY = 705;
  commands.push("0.05 0.35 0.22 rg");
  commands.push(`BT /F2 10 Tf 40 ${currentY} Td (PART I: TENANT CITIZEN PARTICULARS) Tj ET`);

  const rowHeight = 16;
  const fieldsPart1 = [
    { label: "1. Tenant Full Name:", value: data.tenant.full_name },
    { label: "2. Father's Name:", value: data.tenant.father_name || "As declared in NID records" },
    { label: "3. Mother's Name:", value: data.tenant.mother_name || "As declared in NID records" },
    { label: "4. Date of Birth & Gender:", value: `${data.tenant.date_of_birth || "Recorded in KYC"} | Gender: ${data.tenant.gender}` },
    { label: "5. Marital Status:", value: data.tenant.marital_status || "Single / Bachelor" },
    { label: "6. Permanent Address:", value: data.tenant.permanent_address || "Village/Town, District (Recorded in NID Database)" },
    { label: "7. Occupation & Company/Institute:", value: `${data.tenant.occupation} - ${data.tenant.institution_or_company || "Dhaka, Bangladesh"}` },
    { label: "8. Mobile Phone & Email:", value: `${data.tenant.phone} | ${data.tenant.email}` },
    {
      label: "9. National ID (NID) / Passport No:",
      value: `${data.tenant.nid_number || "Verified via BachNest KYC"} ${data.tenant.is_kyc_verified ? "[Verified Digital Citizen]" : ""}`,
    },
    {
      label: "10. Emergency Contact Person:",
      value: data.tenant.emergency_contact_name
        ? `${data.tenant.emergency_contact_name} (${data.tenant.emergency_contact_relation || "Guardian/Friend"}) - ${data.tenant.emergency_contact_phone || ""}`
        : "Guardian / Local Contact Recorded in Profile",
    },
  ];

  currentY -= 6;
  fieldsPart1.forEach((f) => {
    currentY -= rowHeight;
    commands.push("0.2 0.25 0.3 rg");
    commands.push(`BT /F2 8.5 Tf 40 ${currentY} Td (${escapePdfText(f.label)}) Tj ET`);
    commands.push("0.05 0.1 0.15 rg");
    commands.push(`BT /F1 8.5 Tf 190 ${currentY} Td (${escapePdfText(f.value)}) Tj ET`);
  });

  // Section 2: Rented Premises & Lease Terms
  currentY -= 14;
  commands.push("0.8 0.84 0.88 RG 1 w");
  commands.push(`40 ${currentY} m 555 ${currentY} l S`);

  currentY -= 14;
  commands.push("0.05 0.35 0.22 rg");
  commands.push(`BT /F2 10 Tf 40 ${currentY} Td (PART II: PREMISES & TENANCY PARTICULARS) Tj ET`);

  const fieldsPart2 = [
    { label: "11. Rented Premises Address:", value: `${data.property.title}, ${data.property.address_line}, ${data.property.area_neighborhood}, ${data.property.city}` },
    { label: "12. Flat & Room / Seat Allotted:", value: `Flat No: ${data.property.flat_number || "N/A"} | Room: ${data.room?.room_number_or_name || "Assigned Room"}` },
    { label: "13. Tenancy Commencement Date:", value: formatDate(data.lease_start_date) },
    { label: "14. Monthly Rent & Security Deposit:", value: `Rent: ${formatMoney(data.monthly_rent)}/mo | Deposit: ${formatMoney(data.security_deposit)}` },
    { label: "15. Co-occupants / Roommates:", value: data.co_occupants_info || "Enrolled bachelors registered through BachNest" },
  ];

  currentY -= 6;
  fieldsPart2.forEach((f) => {
    currentY -= rowHeight;
    commands.push("0.2 0.25 0.3 rg");
    commands.push(`BT /F2 8.5 Tf 40 ${currentY} Td (${escapePdfText(f.label)}) Tj ET`);
    commands.push("0.05 0.1 0.15 rg");
    commands.push(`BT /F1 8.5 Tf 190 ${currentY} Td (${escapePdfText(f.value)}) Tj ET`);
  });

  // Section 3: Landlord Particulars
  currentY -= 14;
  commands.push("0.8 0.84 0.88 RG 1 w");
  commands.push(`40 ${currentY} m 555 ${currentY} l S`);

  currentY -= 14;
  commands.push("0.05 0.35 0.22 rg");
  commands.push(`BT /F2 10 Tf 40 ${currentY} Td (PART III: LANDLORD / PROPERTY OWNER PARTICULARS) Tj ET`);

  const fieldsPart3 = [
    { label: "16. Landlord / Owner Full Name:", value: data.owner.full_name },
    { label: "17. Landlord Mobile & Email:", value: `${data.owner.phone} | ${data.owner.email}` },
    { label: "18. Landlord Residential Address:", value: data.owner.address || `${data.property.area_neighborhood}, ${data.property.city}` },
  ];

  currentY -= 6;
  fieldsPart3.forEach((f) => {
    currentY -= rowHeight;
    commands.push("0.2 0.25 0.3 rg");
    commands.push(`BT /F2 8.5 Tf 40 ${currentY} Td (${escapePdfText(f.label)}) Tj ET`);
    commands.push("0.05 0.1 0.15 rg");
    commands.push(`BT /F1 8.5 Tf 190 ${currentY} Td (${escapePdfText(f.value)}) Tj ET`);
  });

  // Section 4: Declaration & Signatures
  currentY -= 16;
  commands.push("0.96 0.97 0.98 rg");
  commands.push(`40 ${currentY - 26} 515 32 re f`);
  commands.push("0.85 0.88 0.92 RG 0.5 w");
  commands.push(`40 ${currentY - 26} 515 32 re S`);

  commands.push("0.25 0.3 0.35 rg");
  commands.push(`BT /F2 8 Tf 48 ${currentY - 10} Td (LEGAL DECLARATION & CITIZEN UNDERTAKING:) Tj ET`);
  commands.push(`BT /F1 7.5 Tf 48 ${currentY - 20} Td (I solemnly affirm that the information furnished herein is true, correct, and complete to the best of my knowledge.) Tj ET`);

  // Dual Signature Lines
  currentY -= 65;
  commands.push("0.6 0.65 0.7 RG 1 w");
  commands.push(`60 ${currentY} m 220 ${currentY} l S`);
  commands.push(`360 ${currentY} m 520 ${currentY} l S`);

  commands.push("0.1 0.15 0.2 rg");
  commands.push(`BT /F2 8.5 Tf 80 ${currentY - 12} Td (Signature of Tenant) Tj ET`);
  commands.push(`BT /F1 7.5 Tf 85 ${currentY - 22} Td (Date: ${escapePdfText(formatDate(data.lease_start_date))}) Tj ET`);

  commands.push(`BT /F2 8.5 Tf 380 ${currentY - 12} Td (Signature of Landlord) Tj ET`);
  commands.push(`BT /F1 7.5 Tf 385 ${currentY - 22} Td (Endorsed & Verified) Tj ET`);

  // Footer Note
  commands.push("0.5 0.55 0.6 rg");
  commands.push("BT /F1 7 Tf 120 28 Td (Generated via BachNest Platform for DMP Citizen Information Management System Compliance) Tj ET");

  const streamContent = commands.join("\n");
  const streamLength = streamContent.length;

  const pdfObjects: string[] = [];

  pdfObjects.push("<< /Type /Catalog /Pages 2 0 R >>");
  pdfObjects.push("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  pdfObjects.push(
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] " +
      "/Contents 4 0 R /Resources << /Font << " +
      "/F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> " +
      "/F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> " +
      ">> >> >>"
  );
  pdfObjects.push(`<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream`);

  let output = "%PDF-1.4\n";
  const xrefOffsets: number[] = [];

  for (let i = 0; i < pdfObjects.length; i++) {
    xrefOffsets.push(output.length);
    output += `${i + 1} 0 obj\n${pdfObjects[i]}\nendobj\n`;
  }

  const startXref = output.length;
  output += `xref\n0 ${pdfObjects.length + 1}\n`;
  output += "0000000000 65535 f \n";

  for (let i = 1; i <= pdfObjects.length; i++) {
    const offsetStr = String(xrefOffsets[i - 1]).padStart(10, "0");
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

export function downloadDmpPolicePdf(data: DMPFormData): void {
  const blob = generateDmpPolicePdfBlob(data);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `DMP-Tenant-Verification-${data.tenant.full_name.replace(/\s+/g, "_")}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
