# Cobros bot

Bot de Telegram que avisa cada transferencia entrante que llega a tu Gmail.

- Funciona con cualquier billetera/banco que mande notificaciones por mail (Letsbit, Copter, Bipagos, Mercado Pago, Lemon, Naranja X, etc).
- Corre 24/7 gratis usando **GitHub Actions** — no necesitás VPS ni tarjeta de crédito.
- Setup completo en ~15 minutos siguiendo las guías de `/docs`.

## Cómo funciona

```
Gmail (filtro → label "cobros")
   ↓
GitHub Actions (cron cada 5 min)
   ↓
Lee los mails nuevos del label
   ↓
Parsea monto + remitente + provider
   ↓
Te avisa por Telegram + guarda historial
```

Cada 5 minutos el bot:
1. Se conecta a tu Gmail vía IMAP.
2. Busca mails sin leer en el label que vos elijas.
3. Parsea cada mail (extrae monto, pagador, billetera).
4. Te manda un mensaje a Telegram.
5. Marca el mail como leído (para no avisarte dos veces).
6. Procesa los comandos `/resumen` y `/ultimas N` si los enviaste al bot.

## Setup

Seguí estas guías **en orden**:

1. **[docs/01-telegram.md](docs/01-telegram.md)** — crear el bot de Telegram y obtener tu chat ID (~3 min).
2. **[docs/02-gmail.md](docs/02-gmail.md)** — activar IMAP, generar app password, crear el label y los filtros (~7 min).
3. **[docs/03-github.md](docs/03-github.md)** — forkear este repo, agregar los secrets y activar GitHub Actions (~5 min).

Cuando termines los 3 pasos, el bot va a estar funcionando solo. Si entra una transferencia a tu cuenta y llega el mail, te avisa por Telegram dentro de los próximos 5-10 minutos.

## Comandos disponibles

Una vez prendido el bot, podés escribirle estos comandos:

- `/start` o `/help` — muestra la ayuda.
- `/resumen` — total y cantidad de transferencias del día.
- `/ultimas N` — últimas N transferencias (default 5, máx 20).

> Los comandos los procesa el mismo cron de 5 minutos, así que la respuesta puede demorar hasta 5-10 min. Es lo que tiene no pagar servidor.

## Estructura del repo

```
.
├── README.md                  → este archivo
├── docs/                      → guías paso a paso
│   ├── 01-telegram.md
│   ├── 02-gmail.md
│   └── 03-github.md
├── .github/workflows/check.yml→ cron de GitHub Actions
├── src/
│   ├── index.js               → entrypoint
│   ├── mails.js               → IMAP
│   ├── telegram.js            → bot
│   ├── parsers/               → un archivo por billetera
│   ├── store.js               → historial JSONL
│   └── commands.js            → /resumen, /ultimas
├── data/
│   └── transfers.jsonl        → historial (lo escribe el bot solo)
└── package.json
```

## Si algo no funciona

- **No me llegan mensajes** → revisá las "Actions" en GitHub: si el workflow falla vas a ver el error ahí.
- **Mail no parseado** → significa que el formato del mail no matchea ningún parser. Mandame el remitente y el asunto.
- **Recibí el mensaje pero el monto está mal** → idem, mandame ejemplo del mail.

## Privacidad

- Tus credenciales (app password de Gmail, token del bot) viven solo en los **secrets de GitHub Actions** de tu fork — encriptados, no se ven en logs.
- El bot tiene permisos **READ-ONLY** sobre tu Gmail. Solo lee y marca como leído. No puede enviar, eliminar ni mover mails fuera del label configurado.
- El historial (`data/transfers.jsonl`) queda en tu repo. Si lo querés privado, hacé el fork como repo privado (GitHub te da Actions gratis en repos privados también, hasta 2000 min/mes).
