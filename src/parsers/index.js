import { parseLetsbit } from "./letsbit.js";
import { parseCopter } from "./copter.js";
import { parseBipagos } from "./bipagos.js";
import { parseGeneric } from "./generic.js";

// Router: elige el parser según el remitente.
// Si el específico no logra extraer monto, cae al genérico.
// Si nada matchea, devuelve null y el caller decide si notificar igual.
export function parseTransfer({ from, subject, text, html }) {
  const lowerFrom = (from ?? "").toLowerCase();
  const body = text || stripHtml(html || "");
  const ctx = { from, subject, text: body, html };

  let parsed = null;
  if (lowerFrom.includes("letsbit")) parsed = parseLetsbit(ctx);
  else if (lowerFrom.includes("copter")) parsed = parseCopter(ctx);
  else if (lowerFrom.includes("bipago")) parsed = parseBipagos(ctx);

  if (!parsed) parsed = parseGeneric(ctx);
  return parsed;
}

function stripHtml(s) {
  if (!s) return "";
  return s
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&[#\w]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
