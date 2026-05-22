# 1. Crear el bot de Telegram

Tiempo: ~3 minutos.

## 1.1 Crear el bot con @BotFather

1. Abrí Telegram y buscá **@BotFather** (el oficial, verificado con tilde azul).
2. Mandale `/newbot`.
3. Te va a pedir un **nombre** (el que te aparece en el chat, ej "Mis Cobros").
4. Después te pide un **username** que tiene que terminar en `bot` (ej `mis_cobros_bot`). Si está tomado probá otra variante.
5. BotFather te devuelve un mensaje con el **token** del bot. Se ve así:

   ```
   1234567890:AABBccDDeeFFggHHiiJJkkLLmmNNooPPqqRR
   ```

   **Guardalo a mano** — vas a ponerlo en GitHub más tarde como `TELEGRAM_BOT_TOKEN`.

## 1.2 Empezar a hablarle al bot

1. Buscá tu bot en Telegram por el username que elegiste.
2. Apretá **Iniciar** o mandale cualquier mensaje (ej "hola"). Esto es importante: sin esto, el bot no te puede escribir.

## 1.3 Obtener tu chat ID

1. Abrí en tu navegador esta URL, reemplazando `<TOKEN>` por el token que te dio BotFather:

   ```
   https://api.telegram.org/bot<TOKEN>/getUpdates
   ```

2. Vas a ver un JSON. Buscá el campo `"chat":{"id":` — el número que está después es tu **chat ID**. Se ve así:

   ```json
   "chat":{"id":123456789,"first_name":"Tu Nombre", ...}
   ```

3. **Anotá ese número** (positivo o negativo). Vas a ponerlo en GitHub como `TELEGRAM_CHAT_ID`.

> Si el JSON viene vacío (`"result":[]`), volvé a Telegram y mandale otro mensaje al bot, después refrescá la URL.

## Listo

Anotate estos 2 valores:

```
TELEGRAM_BOT_TOKEN = 1234567890:AABBccDDeeFFggHHiiJJkkLLmmNNooPPqqRR
TELEGRAM_CHAT_ID   = 123456789
```

→ Seguí con [02-gmail.md](02-gmail.md).
