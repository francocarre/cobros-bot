import { fetchUnseen, markSeen } from "./mails.js";
import { parseTransfer } from "./parsers/index.js";
import { sendMessage, consumeUpdates } from "./telegram.js";
import { appendTransfer } from "./store.js";
import { handleCommand } from "./commands.js";
import { fmtARS, fmtDate } from "./utils/fmt.js";

const REQUIRED_ENV = [
  "GMAIL_USER",
  "GMAIL_APP_PASSWORD",
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_CHAT_ID",
];

const PROVIDER_LABEL = {
  letsbit: "Letsbit",
  copter: "Copter",
  bipagos: "Bipagos",
  mercadopago: "Mercado Pago",
  lemon: "Lemon Cash",
  naranjax: "Naranja X",
  personalpay: "Personal Pay",
  otro: "Otro",
};

function escapeMd(s) {
  return String(s ?? "").replace(/([_*`\[\]])/g, "\\$1");
}

function formatTelegramMessage({ provider, amount, payer, date, subject }) {
  const lines = [
    "💸 *NUEVA TRANSFERENCIA*",
    "",
    `Cuenta: *${escapeMd(PROVIDER_LABEL[provider] ?? provider)}*`,
    `Monto: \`${fmtARS(amount)}\``,
  ];
  if (payer) lines.push(`De: ${escapeMd(payer)}`);
  lines.push(`Fecha: ${escapeMd(fmtDate(date))}`);
  if (subject) lines.push(`\n_${escapeMd(subject).slice(0, 120)}_`);
  return lines.join("\n");
}

// Loop de polling activo dentro del mismo run de GitHub Actions.
// El cron arranca cada 5 min; durante ~4 min hacemos polling cada 15s y salimos
// limpio antes del próximo cron. Latencia max ≈ 15s salvo el gap entre runs.
const LOOP_DURATION_MS = 4 * 60 * 1000;
const POLL_INTERVAL_MS = 15 * 1000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function processIteration({ env }) {
  const {
    GMAIL_USER,
    GMAIL_APP_PASSWORD,
    GMAIL_LABEL,
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID,
  } = env;

  // 1) Telegram updates (comandos como /saldo).
  try {
    const updates = await consumeUpdates({ token: TELEGRAM_BOT_TOKEN });
    for (const upd of updates) {
      const msg = upd.message;
      if (!msg || !msg.text) continue;
      if (String(msg.chat.id) !== String(TELEGRAM_CHAT_ID)) continue;
      await handleCommand({
        token: TELEGRAM_BOT_TOKEN,
        chatId: msg.chat.id,
        text: msg.text,
      }).catch((e) => console.error("Command error:", e.message));
    }
  } catch (e) {
    console.error("Telegram updates error:", e.message);
  }

  // 2) Mails UNSEEN.
  let pulled;
  try {
    pulled = await fetchUnseen({
      user: GMAIL_USER,
      password: GMAIL_APP_PASSWORD,
      label: GMAIL_LABEL || "INBOX",
    });
  } catch (e) {
    console.error("IMAP error:", e.message);
    return; // próxima iteración reintenta
  }

  const { mails, mailbox } = pulled;
  if (mails.length > 0) console.log(`Mails sin leer en "${mailbox}": ${mails.length}`);

  const successfullyNotified = [];
  for (const mail of mails) {
    try {
      const parsed = parseTransfer({
        from: mail.from,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
      });

      if (!parsed || !parsed.amount) {
        console.warn(`Mail no parseado: from="${mail.from}" subject="${mail.subject}"`);
        continue;
      }

      const text = formatTelegramMessage({
        provider: parsed.provider,
        amount: parsed.amount,
        payer: parsed.payer,
        date: mail.date,
        subject: mail.subject,
      });

      await sendMessage({ token: TELEGRAM_BOT_TOKEN, chatId: TELEGRAM_CHAT_ID, text });

      await appendTransfer({
        ts: new Date(mail.date).toISOString(),
        provider: parsed.provider,
        amount: parsed.amount,
        payer: parsed.payer,
        from: mail.from,
        subject: mail.subject,
        uid: mail.uid,
      });

      successfullyNotified.push(mail.uid);
    } catch (e) {
      console.error(`Error procesando UID ${mail.uid}:`, e.message);
    }
  }

  if (successfullyNotified.length > 0) {
    try {
      await markSeen({
        user: GMAIL_USER,
        password: GMAIL_APP_PASSWORD,
        mailbox,
        uids: successfullyNotified,
      });
      console.log(`Marcados como leídos: ${successfullyNotified.length}`);
    } catch (e) {
      console.error("markSeen error:", e.message);
    }
  }
}

async function main() {
  const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.error(`Faltan variables de entorno: ${missing.join(", ")}`);
    process.exit(1);
  }

  const endTime = Date.now() + LOOP_DURATION_MS;
  let iter = 0;
  while (Date.now() < endTime) {
    iter++;
    await processIteration({ env: process.env });
    const remaining = endTime - Date.now();
    if (remaining <= 0) break;
    await sleep(Math.min(POLL_INTERVAL_MS, remaining));
  }
  console.log(`Loop terminado tras ${iter} iteraciones.`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
