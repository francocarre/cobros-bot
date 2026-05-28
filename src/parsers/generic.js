import { parseARS } from "../utils/fmt.js";

// Fallback parser: busca el primer monto en formato peso argentino dentro del texto.
// Devuelve { amount, payer, provider } o null si no encontró nada utilizable.
export function parseGeneric({ from, subject, text }) {
  const body = `${subject ?? ""}\n${text ?? ""}`;
  if (!body) return null;

  // Capturas tipo $ 1.234.567,89 / ARS 1.234,56 / $1234,56 / 1.234.567 / 1234.56
  const moneyRe =
    /(?:AR\$|ARS|\$)\s*([\d]{1,3}(?:\.[\d]{3})+(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?)/g;
  let amount = null;
  let match;
  while ((match = moneyRe.exec(body)) !== null) {
    const parsed = parseARS(match[1]);
    if (parsed && parsed > 0) {
      amount = parsed;
      break;
    }
  }

  // Buscar pagador con patrones comunes en español
  let payer = null;
  const payerPatterns = [
    /(?:de|recibiste de|enviado por|remitente|from)[:\s]+([A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚáéíóúÑñ.'\-]+(?:\s+[A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚáéíóúÑñ.'\-]+){0,3})/i,
  ];
  for (const re of payerPatterns) {
    const m = body.match(re);
    if (m && m[1]) {
      payer = m[1].trim();
      break;
    }
  }

  if (!amount) return null;
  return {
    amount,
    payer,
    provider: providerFromEmail(from) ?? "otro",
  };
}

function providerFromEmail(from) {
  if (!from) return null;
  const f = from.toLowerCase();
  if (f.includes("letsbit") || f.includes("lbfinanzas")) return "letsbit";
  if (f.includes("copter")) return "copter";
  if (f.includes("bipagos") || f.includes("bipago")) return "bipagos";
  if (f.includes("mercadopago") || f.includes("mercado-pago")) return "mercadopago";
  if (f.includes("lemon")) return "lemon";
  if (f.includes("naranja")) return "naranjax";
  if (f.includes("personalpay")) return "personalpay";
  return null;
}
