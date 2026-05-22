const TG_BASE = "https://api.telegram.org/bot";

export async function sendMessage({ token, chatId, text, parseMode = "Markdown" }) {
  const res = await fetch(`${TG_BASE}${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      disable_web_page_preview: true,
    }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(`Telegram sendMessage falló: ${json.description || res.status}`);
  return json.result;
}

/**
 * getUpdates con confirmación automática.
 * Devuelve los updates pendientes y confirma todos (Telegram no los re-entrega).
 */
export async function consumeUpdates({ token }) {
  // 1) Traer pendientes (timeout=0 long polling no-op).
  const r1 = await fetch(`${TG_BASE}${token}/getUpdates?timeout=0&allowed_updates=%5B%22message%22%5D`);
  const j1 = await r1.json();
  if (!j1.ok) throw new Error(`Telegram getUpdates falló: ${j1.description || r1.status}`);
  const updates = j1.result ?? [];

  // 2) Confirmar (offset = max update_id + 1)
  if (updates.length > 0) {
    const maxId = Math.max(...updates.map((u) => u.update_id));
    await fetch(`${TG_BASE}${token}/getUpdates?offset=${maxId + 1}&timeout=0`).catch(() => {});
  }
  return updates;
}
