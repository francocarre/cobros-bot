# 3. Setear GitHub Actions

Tiempo: ~5 minutos.

## 3.1 Forkear el repo

1. Abrí el repo `cobros-bot` (te lo pasó Franco).
2. Arriba a la derecha, apretá **Fork**. Si no tenés cuenta de GitHub, hacela primero en [github.com/signup](https://github.com/signup) — es gratis.
3. Aceptá el fork con tu usuario. Te queda una copia tuya tipo `tu-usuario/cobros-bot`.

> **¿Privado o público?** Para no exponer tu historial de transferencias, abrí el fork como **privado**. GitHub te da 2000 minutos de Actions por mes gratis incluso en repos privados, más que suficiente.

## 3.2 Cargar los 5 secrets

1. En tu fork, andá a **Settings** (arriba a la derecha).
2. Barra izquierda → **Secrets and variables** → **Actions**.
3. Apretá **"New repository secret"** y agregá uno por uno los siguientes:

| Nombre del secret | Valor |
|---|---|
| `TELEGRAM_BOT_TOKEN` | el token que te dio @BotFather |
| `TELEGRAM_CHAT_ID` | tu chat ID (el número que viste en `getUpdates`) |
| `GMAIL_USER` | tu email de Gmail |
| `GMAIL_APP_PASSWORD` | la contraseña de aplicación de 16 caracteres |
| `GMAIL_LABEL` | `cobros` (o el nombre que le hayas puesto al label) |

> Una vez guardados los secrets, GitHub los muestra como `***` — no se pueden volver a ver. Si te equivocaste, lo borrás y lo cargás de nuevo.

## 3.3 Habilitar Actions

1. En tu fork, solapa **Actions** (arriba).
2. La primera vez te va a pedir confirmar que querés correr workflows del fork — apretá **"I understand my workflows, go ahead and enable them"**.
3. Vas a ver el workflow **"Cobros bot"**. Apretá ahí.
4. Arriba a la derecha tenés **"Run workflow"** → corré uno manual para testear.

## 3.4 Verificar que funciona

Después del primer run manual:

1. Andá al Telegram donde tenés el bot y mandale `/start`. Si responde con la ayuda → el bot está OK.
2. Si tenés algún mail viejo sin leer en el label `cobros`, también deberías recibir uno o varios mensajes de transferencia.
3. Si en cambio no llega nada en 2-3 min:
   - Volvé a la solapa Actions → entrá al run → mirá los logs.
   - Errores típicos: secret mal escrito, app password con espacios mal, label que no existe.

## Cómo funciona el cron

A partir de acá el workflow corre solo cada 5 minutos. Importante:
- GitHub Actions tiene **jitter** — en horas pico puede demorar hasta 10-15 min.
- Si querés forzar un check, andá a Actions → Cobros bot → **Run workflow**.

## Cómo apagar el bot

Si querés parar el bot temporal o definitivamente:
- **Pausar:** Settings → Actions → General → "Disable Actions".
- **Borrar:** simplemente borrá el fork.

## Listo

Ya está, no tenés que hacer nada más. Las transferencias van a empezar a aparecer en tu Telegram.

Volvé al [README](../README.md) si querés ver los comandos disponibles.
