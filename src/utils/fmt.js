// Formato moneda y fecha en castellano argentino.

export function fmtARS(n) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n));
}

export function fmtDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Parsea strings tipo "$ 250.000,00", "ARS 250.000,00", "$250.000,00",
// "AR$ 1.234.567,89", "1.234,56", "1234.56".
// Devuelve number o null.
export function parseARS(s) {
  if (!s) return null;
  const cleaned = String(s)
    .replace(/AR\$|ARS|\$|\s/gi, "")
    .trim();
  if (!cleaned) return null;

  let normalized;
  // Si tiene punto y coma, asumimos formato AR (1.234,56)
  if (cleaned.includes(",") && cleaned.includes(".")) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (cleaned.includes(",")) {
    // Solo coma → decimal AR (1234,56)
    normalized = cleaned.replace(",", ".");
  } else {
    // Solo puntos → puede ser separador de miles AR o decimal US.
    // Si hay más de un punto, son miles. Si hay uno solo y deja 1-2 decimales, es decimal.
    const dots = cleaned.match(/\./g) ?? [];
    if (dots.length > 1) {
      normalized = cleaned.replace(/\./g, "");
    } else if (dots.length === 1) {
      const [, dec] = cleaned.split(".");
      normalized = dec && dec.length <= 2 ? cleaned : cleaned.replace(".", "");
    } else {
      normalized = cleaned;
    }
  }

  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}
