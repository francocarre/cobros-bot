import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

/**
 * Conecta IMAP, busca mails UNSEEN dentro del label/mailbox configurado,
 * y devuelve una lista parseada. NO marca como leídos — eso se hace después
 * de notificar exitosamente (markSeen).
 */
export async function fetchUnseen({ user, password, label }) {
  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: { user, pass: password },
    logger: false,
  });

  const mails = [];
  const seenUids = [];

  await client.connect();
  try {
    // Para Gmail los "labels" funcionan como mailboxes anidados.
    const mailbox = label ? `[Gmail]/${label}`.replace(/^\[Gmail\]\//, "") : "INBOX";
    const target = label ? label : "INBOX";

    const lock = await client.getMailboxLock(target);
    try {
      // Buscar UNSEEN
      const uids = await client.search({ seen: false }, { uid: true });
      if (!uids || uids.length === 0) return { mails, seenUids, mailbox: target };

      for (const uid of uids) {
        const msg = await client.fetchOne(uid, { source: true, envelope: true }, { uid: true });
        if (!msg || !msg.source) continue;

        const parsed = await simpleParser(msg.source);
        mails.push({
          uid,
          from: parsed.from?.text ?? msg.envelope?.from?.[0]?.address ?? "",
          subject: parsed.subject ?? msg.envelope?.subject ?? "",
          text: parsed.text ?? "",
          html: typeof parsed.html === "string" ? parsed.html : "",
          date: parsed.date ?? msg.envelope?.date ?? new Date(),
        });
        seenUids.push(uid);
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => {});
  }

  return { mails, seenUids, mailbox: label || "INBOX" };
}

/**
 * Marca una lista de UIDs como leídos en el mailbox indicado.
 * Llamar SOLO después de notificar a Telegram exitosamente.
 */
export async function markSeen({ user, password, mailbox, uids }) {
  if (!uids || uids.length === 0) return;
  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: { user, pass: password },
    logger: false,
  });
  await client.connect();
  try {
    const lock = await client.getMailboxLock(mailbox);
    try {
      await client.messageFlagsAdd(uids, ["\\Seen"], { uid: true });
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => {});
  }
}
