import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const TRANSFERS_FILE = path.join(DATA_DIR, "transfers.jsonl");

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

/**
 * Appendea una transferencia al log JSONL.
 * Estructura: { ts, provider, amount, payer, from, subject }
 */
export async function appendTransfer(record) {
  await ensureDir();
  const line = JSON.stringify(record) + "\n";
  await fs.appendFile(TRANSFERS_FILE, line, "utf8");
}

/**
 * Lee todas las transferencias del log.
 */
export async function readTransfers() {
  await ensureDir();
  try {
    const raw = await fs.readFile(TRANSFERS_FILE, "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch (e) {
    if (e.code === "ENOENT") return [];
    throw e;
  }
}
