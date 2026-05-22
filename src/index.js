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

async function main() {
  // 1) Validar env.
  const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.error(`Faltan variables de entorno: ${missing.join(", ")}`);
    process.exit(1);
  }

  const {
    GMAIL_USER,
    GMAIL_APP_PASSWORD,
    GMAIL_LABEL,
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID,
  } = process.env;

  // 2) Procesar comandos antes que mails (responde rápido si Franco-cliente escribió).
  try {
    const updates = await consumeUpdates({ token: TELEGRAM_BOT_TOKEN });
    for (const upd of updates) {
      const msg = upd.message;
      if (!msg || !msg.text) continue;
      // Solo respondemos en el chat del dueño.
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

  // 3) Pull de mails UNSEEN.
  let pulled;
  try {
    pulled = await fetchUnseen({
      user: GMAIL_USER,
      password: GMAIL_APP_PASSWORD,
      label: GMAIL_LABEL || "INBOX",
    });
  } catch (e) {
    console.error("IMAP error:", e.message);
    process.exit(1);
  }

  const { mails, mailbox } = pulled;
  console.log(`Mails sin leer en "${mailbox}": ${mails.length}`);

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
        // No se pudo extraer monto: notificar a modo log y NO marcar como leído
        // así el alumno revisa manual.
        console.warn(
          `Mail no parseado: from="${mail.from}" subject="${mail.subject}"`,
        );
        continue;
      }

      const text = formatTelegramMessage({
        provider: parsed.provider,
        amount: parsed.amount,
        payer: parsed.payer,
        date: mail.date,
        subject: mail.subject,
      });

      await sendMessage({
        token: TELEGRAM_BOT_TOKEN,
        chatId: TELEGRAM_CHAT_ID,
        text,
      });

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
      // No marcamos como leído: el próximo run lo reintenta.
    }
  }

  // 4) Marcar como leídos los mails notificados con éxito.
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

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
