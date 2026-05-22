import { readTransfers } from "./store.js";
import { fmtARS, fmtDate } from "./utils/fmt.js";
import { sendMessage } from "./telegram.js";

const TZ_OFFSET_MIN = -180; // ART (UTC-3)

function isSameLocalDay(tsISO) {
  const d = new Date(tsISO);
  const local = new Date(d.getTime() + (TZ_OFFSET_MIN - d.getTimezoneOffset()) * 60_000);
  const now = new Date();
  const nowLocal = new Date(now.getTime() + (TZ_OFFSET_MIN - now.getTimezoneOffset()) * 60_000);
  return (
    local.getUTCFullYear() === nowLocal.getUTCFullYear() &&
    local.getUTCMonth() === nowLocal.getUTCMonth() &&
    local.getUTCDate() === nowLocal.getUTCDate()
  );
}

/**
 * Procesa un comando recibido por Telegram.
 */
export async function handleCommand({ token, chatId, text }) {
  const trimmed = (text ?? "").trim();
  if (!trimmed.startsWith("/")) return false;

  const [cmd, ...args] = trimmed.split(/\s+/);

  if (cmd === "/start" || cmd === "/help") {
    await sendMessage({
      token,
      chatId,
      text:
        "Bot de cobros activo.\n\n" +
        "Cada 5 min reviso tu Gmail y te aviso transferencias nuevas.\n\n" +
        "*Comandos*\n" +
        "/resumen — total del día\n" +
        "/ultimas N — últimas N transferencias (default 5)\n" +
        "/help — esta ayuda",
    });
    return true;
  }

  if (cmd === "/resumen") {
    const all = await readTransfers();
    const today = all.filter((t) => isSameLocalDay(t.ts));
    const total = today.reduce((acc, t) => acc + Number(t.amount ?? 0), 0);
    await sendMessage({
      token,
      chatId,
      text:
        `*Resumen del día*\n\n` +
        `Transfers: \`${today.length}\`\n` +
        `Total: \`${fmtARS(total)}\``,
    });
    return true;
  }

  if (cmd === "/ultimas") {
    const n = Math.min(Math.max(parseInt(args[0] ?? "5", 10) || 5, 1), 20);
    const all = (await readTransfers()).slice(-n).reverse();
    if (all.length === 0) {
      await sendMessage({ token, chatId, text: "Sin transferencias registradas todavía." });
      return true;
    }
    const lines = all.map(
      (t) =>
        `• ${fmtDate(t.ts)} — *${t.provider}* — \`${fmtARS(t.amount)}\`` +
        (t.payer ? ` — _${t.payer}_` : ""),
    );
    await sendMessage({
      token,
      chatId,
      text: `*Últimas ${all.length}*\n\n${lines.join("\n")}`,
    });
    return true;
  }

  await sendMessage({
    token,
    chatId,
    text: `Comando no reconocido: \`${cmd}\`. Usá /help para ver los disponibles.`,
  });
  return true;
}
