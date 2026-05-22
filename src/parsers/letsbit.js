import { parseARS } from "../utils/fmt.js";

// Parser específico Letsbit.
// Formato típico: asunto "Recibiste un pago de NOMBRE" / body con "$ 1.234.567,89".
// Si Letsbit cambia el formato, este parser devuelve null y cae al genérico.
export function parseLetsbit({ subject, text }) {
  const body = `${subject ?? ""}\n${text ?? ""}`;

  // Monto: el primer ARS dentro del body
  const moneyMatch = body.match(
    /(?:AR\$|ARS|\$)\s*([\d]{1,3}(?:\.[\d]{3})+(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?)/,
  );
  const amount = moneyMatch ? parseARS(moneyMatch[1]) : null;
  if (!amount) return null;

  // Pagador: "de NOMBRE" o "pago de NOMBRE"
  let payer = null;
  const payerMatch =
    subject?.match(/de\s+(.+?)(?:\s*$|\s+por\s)/i) ??
    text?.match(/(?:pago\s+de|recibiste\s+de)\s+(.+?)(?:\.|\n|,)/i);
  if (payerMatch) payer = payerMatch[1].trim();

  return {
    amount,
    payer,
    provider: "letsbit",
  };
}
