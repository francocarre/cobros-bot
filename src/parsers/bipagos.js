import { parseARS } from "../utils/fmt.js";

// Parser específico Bipagos.
// Formato (a refinar con sample real): typically subject "Nueva acreditación / cobro"
// con monto y opcionalmente referencia del pagador.
export function parseBipagos({ subject, text }) {
  const body = `${subject ?? ""}\n${text ?? ""}`;

  const moneyMatch = body.match(
    /(?:AR\$|ARS|\$)\s*([\d]{1,3}(?:\.[\d]{3})+(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?)/,
  );
  const amount = moneyMatch ? parseARS(moneyMatch[1]) : null;
  if (!amount) return null;

  let payer = null;
  const payerMatch =
    text?.match(/(?:pagador|remitente|de)[:\s]+([A-ZÁÉÍÓÚÑ][^\n]{2,60})/i);
  if (payerMatch) payer = payerMatch[1].trim();

  return {
    amount,
    payer,
    provider: "bipagos",
  };
}
