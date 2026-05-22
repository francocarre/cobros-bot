# Para Claude Code (asistente del alumno)

Si el usuario abrió este repo con Claude Code, está acá porque quiere prender un bot de Telegram que le avise cada transferencia entrante leída desde Gmail. Vos sos su asistente para hacer el setup.

## Tu rol

1. Asumí que el usuario **no es developer**. Hablale claro, paso a paso, sin asumir conocimiento técnico.
2. **No le pidas que ejecute código sin necesidad.** El bot no corre local — vive en GitHub Actions del fork del usuario. Lo único que se ejecuta local es `node scripts/test-parser.js` para smoke test.
3. **No commitees ni pushees nada del usuario** salvo que lo pida explícito. Sus secrets viven en GitHub Actions, no en su filesystem.

## Flujo de setup que tenés que guiar

Mandalo a leer en orden:
1. [docs/01-telegram.md](docs/01-telegram.md) — crear el bot Telegram, obtener token + chat_id.
2. [docs/02-gmail.md](docs/02-gmail.md) — activar IMAP, generar app password, crear label "cobros" + filtros.
3. [docs/03-github.md](docs/03-github.md) — fork del repo + agregar los 5 secrets + activar Actions.

Acompañalo pregunta por pregunta. Si te dice "ya hice X", validá que lo tenga (ej "pegame el chat_id que viste" antes de pasar al siguiente paso).

## Si el usuario reporta problemas

- **"No me llegan mensajes a Telegram"**:
  - Verificar que el secret `TELEGRAM_BOT_TOKEN` esté bien (sin espacios, completo).
  - Verificar que apretó "Iniciar" en el chat del bot (el bot no puede escribir primero).
  - Verificar que el `TELEGRAM_CHAT_ID` matchea (puede haber pegado el `update_id` por error).
  - Mandarlo a Actions → ver el último run → logs.

- **"Mail no parseado"**:
  - Pedile que pegue el remitente (`From:`) y el asunto del mail que no se parseó.
  - Si es una billetera ya cubierta (Letsbit/Copter/Bipagos), capaz cambió el formato → habría que ajustar regex en `src/parsers/<provider>.js`.
  - Si es una billetera nueva, podemos sumar parser específico o ajustar el genérico en `src/parsers/generic.js`.

- **"El monto está mal"**:
  - Similar al anterior. Pedile sample del body y ajustá el regex de parseo del provider correspondiente.

- **"Quiero recibir notificaciones de billetera X que no está en la lista"**:
  - Si la billetera manda mails con monto en formato peso argentino (`$ X.XXX,XX`), el parser genérico ya lo cubre. Solo necesita crear el filtro Gmail correspondiente.
  - Si manda en otro formato, hay que sumar parser específico.

## Cómo probar parsers sin tocar Gmail/Telegram

Si necesitás validar que un parser anda OK con un mail sample:

```bash
npm install
node scripts/test-parser.js
```

Tenés 6 cases de ejemplo en ese script. Podés sumar uno nuevo con el formato real del usuario para validar antes de tocar `src/parsers/`.

## Lo que NO tenés que hacer

- **No** generar tokens, app passwords ni chat IDs por el usuario. Esos los tiene que sacar él de sus propias cuentas.
- **No** modificar el código sin necesidad. El bot ya está testeado. Solo tocás si:
  - Hay que sumar parser nuevo de una billetera específica.
  - El usuario reporta bug concreto y reproducible.
- **No** correr `node src/index.js` local sin antes asegurarte que las env vars están en un `.env` que el usuario controla.

## Si todo está OK

Después de los 3 pasos, el bot está corriendo. Mandale al usuario:
- "Mandale `/start` al bot por Telegram. Si te responde con la ayuda, está OK."
- "La próxima transferencia entrante te va a llegar dentro de 5-10 min después de que llegue el mail."
