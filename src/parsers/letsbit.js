import { parseARS } from "../utils/fmt.js";

// Parser específico Letsbit / LB Finanzas.
// Soporta dos formatos:
//   1) Letsbit clásico — subject "Recibiste un pago de NOMBRE" + body "$ 1.234,56"
//   2) LB Finanzas 2026 — subject "Nuevo depósito recibido" + body
//      "Recibiste 1.195,80 ARS ... Origen NOMBRE ... CBU/CVU ..."
// Si nada matchea devuelve null y cae al genérico.
export function parseLetsbit({ subject, text }) {
  const body = `${subject ?? ""}\n${text ?? ""}`;

  // --- Monto ---
  let amount = null;

  // Formato LB Finanzas: "Recibiste <NUM> ARS" (anclado a "Recibiste" para
  // evitar agarrar la "Comisión 4,20 ARS" que aparece más abajo).
  const lbAmountMatch = body.match(
    /Recibiste\s+([\d]{1,3}(?:\.[\d]{3})*(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?)\s+ARS\b/i,
  );
  if (lbAmountMatch) amount = parseARS(lbAmountMatch[1]);

  // Formato clásico: "$ NUM" / "ARS NUM" / "AR$ NUM"
  if (!amount) {
    const classicAmountMatch = body.match(
      /(?:AR\$|ARS|\$)\s*([\d]{1,3}(?:\.[\d]{3})+(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?)/,
    );
    if (classicAmountMatch) amount = parseARS(classicAmountMatch[1]);
  }

  if (!amount) return null;

  // --- Pagador ---
  let payer = null;

  // Formato LB Finanzas: "Origen <NOMBRE> CBU/CVU"
  const lbPayerMatch = body.match(/Origen\s+(.+?)\s+(?:CBU|CVU|Fecha)\b/i);
  if (lbPayerMatch) payer = lbPayerMatch[1].trim();

  // Formato clásico: "de NOMBRE" en subject o "pago de NOMBRE" en body
  if (!payer) {
    const classicPayerMatch =
      subject?.match(/de\s+(.+?)(?:\s*$|\s+por\s)/i) ??
      text?.match(/(?:pago\s+de|recibiste\s+de)\s+(.+?)(?:\.|\n|,)/i);
    if (classicPayerMatch) payer = classicPayerMatch[1].trim();
  }

  return {
    amount,
    payer,
    provider: "letsbit",
  };
}
