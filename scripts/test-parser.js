// Smoke test de parsers — corré:  node scripts/test-parser.js
// Útil cuando agregás un parser nuevo o querés validar que los existentes
// extraen lo esperado sin tocar IMAP ni Telegram.

import { parseTransfer } from "../src/parsers/index.js";
import { fmtARS } from "../src/utils/fmt.js";

const cases = [
  {
    name: "Letsbit — formato típico",
    input: {
      from: "noreply@letsbit.io",
      subject: "Recibiste un pago de Juan Perez",
      text: "Hola, te avisamos que recibiste un pago de Juan Perez por $ 250.000,00. Saldo actualizado en tu cuenta.",
      html: "",
    },
  },
  {
    name: "LB Finanzas 2026 — mail HTML real (sample Tincho)",
    input: {
      from: "LB Finanzas 🚀 <no-reply@lbfinanzas.com>",
      subject: "Nuevo depósito recibido",
      text: "",
      html: `<html><body><table><tr><td>Recibiste</td></tr><tr><td>1.195,80 ARS</td></tr><tr><td>Detalle del depósito</td></tr><tr><td>Origen</td><td>Carlos Daniel Garay Broggi</td></tr><tr><td>CBU/CVU</td><td>0000168300000022179821</td></tr><tr><td>Fecha</td><td>25.05.26 14:35</td></tr><tr><td>Comisión</td><td>4,20 ARS</td></tr></table></body></html>`,
    },
    expect: { amount: 1195.8, payer: "Carlos Daniel Garay Broggi", provider: "letsbit" },
  },
  {
    name: "Copter — formato con monto en body",
    input: {
      from: "noreply@copter.com.ar",
      subject: "Nueva acreditación",
      text: "Recibiste ARS 1.234.567,89.\nRemitente: Maria Lopez\nReferencia: 0001",
      html: "",
    },
  },
  {
    name: "Bipagos — body con pagador",
    input: {
      from: "notificaciones@bipagos.com.ar",
      subject: "Cobro acreditado",
      text: "Te acreditamos $ 75.000,00.\nPagador: Carlos Garcia\nFecha: 22/05/2026",
      html: "",
    },
  },
  {
    name: "Genérico — Mercado Pago",
    input: {
      from: "noresponder@mercadopago.com.ar",
      subject: "¡Recibiste un pago!",
      text: "Te depositaron $ 12.500,50. De Pedro Diaz.",
      html: "",
    },
  },
  {
    name: "Genérico — sin remitente conocido",
    input: {
      from: "alguien@desconocido.com",
      subject: "Cobro",
      text: "Acreditado: ARS 9.876,54 de Ana",
      html: "",
    },
  },
  {
    name: "Mail sin monto — debería devolver null",
    input: {
      from: "info@letsbit.io",
      subject: "Te queremos contar algo",
      text: "Sin datos relevantes acá.",
      html: "",
    },
  },
];

let passed = 0;
let failed = 0;

for (const c of cases) {
  const result = parseTransfer(c.input);
  const ok = (() => {
    if (c.name.includes("sin monto")) return result === null || result?.amount === undefined;
    return result && typeof result.amount === "number" && result.amount > 0;
  })();

  if (ok) {
    passed++;
    console.log(`✓ ${c.name}`);
    if (result) {
      console.log(
        `    provider=${result.provider}  amount=${fmtARS(result.amount)}  payer=${result.payer ?? "—"}`,
      );
    } else {
      console.log(`    (sin parseo, esperado)`);
    }
  } else {
    failed++;
    console.log(`✗ ${c.name}`);
    console.log(`    result=${JSON.stringify(result)}`);
  }
}

console.log(`\n${passed} OK · ${failed} fallaron · ${cases.length} total`);
process.exit(failed === 0 ? 0 : 1);
