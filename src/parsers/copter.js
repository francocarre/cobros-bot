import { parseARS } from "../utils/fmt.js";

// Parser específico Copter.
// Formato típico (a confirmar con sample real): asunto "Acreditación X.XXX,XX" / body
// con monto y remitente.
export function parseCopter({ subject, text }) {
  const body = `${subject ?? ""}\n${text ?? ""}`;

  const moneyMatch = body.match(
    /(?:AR\$|ARS|\$)\s*([\d]{1,3}(?:\.[\d]{3})+(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?)/,
  );
  const amount = moneyMatch ? parseARS(moneyMatch[1]) : null;
  if (!amount) return null;

  let payer = null;
  const payerMatch =
    text?.match(/(?:de|remitente|desde)[:\s]+([A-ZÁÉÍÓÚÑ][^\n]{2,60})/i) ??
    subject?.match(/de\s+(.+?)$/i);
  if (payerMatch) payer = payerMatch[1].trim();

  return {
    amount,
    payer,
    provider: "copter",
  };
}
