# 2. Configurar Gmail

Tiempo: ~7 minutos.

Para que el bot pueda leer tus mails necesitamos tres cosas:
1. Tener **2FA activada** (requisito de Google para app passwords).
2. Generar una **contraseña de aplicación** (16 caracteres).
3. Crear un **label** y **filtros** que clasifiquen automáticamente los mails de tus billeteras.

> 💡 Recomendación: usá una casilla Gmail **dedicada** (ej `cobros.mati@gmail.com`) en vez de tu Gmail personal. Configurá las billeteras para que las notificaciones lleguen ahí. Más prolijo y más seguro.

## 2.1 Activar 2FA (si no la tenés)

1. Andá a [myaccount.google.com/security](https://myaccount.google.com/security).
2. En **"Verificación en dos pasos"**, activala (si dice "Activado" ya estás).

## 2.2 Generar app password

1. Andá a [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
   > Si no te aparece, es porque no tenés 2FA activada. Volvé al paso anterior.
2. En **"Nombre de la app"** poné `cobros-bot` (o lo que quieras).
3. Apretá **Crear**.
4. Google te muestra una contraseña de 16 caracteres con espacios, tipo:

   ```
   abcd efgh ijkl mnop
   ```

5. **Guardala** — la vas a poner en GitHub como `GMAIL_APP_PASSWORD`. Se ve solo una vez; si la perdés generás otra.

## 2.3 Activar IMAP

1. Abrí Gmail → ⚙️ arriba a la derecha → **"Ver toda la configuración"**.
2. Solapa **"Reenvío y correo POP/IMAP"**.
3. En **"Acceso IMAP"** marcá **"Habilitar IMAP"**.
4. Guardar cambios.

## 2.4 Crear el label "cobros"

1. En la barra izquierda de Gmail, scroll down hasta encontrar **"Crear etiqueta nueva"** (o `+` al lado de "Etiquetas").
2. Nombre: `cobros`. Crear.

## 2.5 Crear filtros para clasificar automático

Por cada billetera que querés monitorear, vas a crear un filtro que mande sus mails a la etiqueta `cobros` (y opcionalmente los marque como ya leídos en la bandeja principal).

### Cómo crear un filtro en Gmail

1. Click en la **barra de búsqueda** de Gmail → flechita ⏷ a la derecha.
2. En **"De"** poné el email del remitente de la billetera (ver lista abajo).
3. Apretá **"Crear filtro"**.
4. Tildá **"Aplicar la etiqueta"** → seleccioná `cobros`.
5. **NO** tildés "Marcar como leída" (el bot necesita que estén sin leer para procesarlas).
6. Apretá **"Crear filtro"**.

### Remitentes habituales (confirmá los reales con un mail de prueba)

| Billetera | Remitente típico |
|---|---|
| Letsbit | `noreply@letsbit.io` o `info@letsbit.io` |
| Copter | `noreply@copter.com.ar` |
| Bipagos | `notificaciones@bipagos.com.ar` |
| Mercado Pago | `noresponder@mercadopago.com.ar` |
| Lemon Cash | `noreply@lemon.com.ar` |
| Naranja X | `notificaciones@naranjax.com` |
| Personal Pay | `noreply@personalpay.com.ar` |

> Si no estás seguro del remitente exacto, mirá un mail real que ya te haya llegado. Abrilo → "▾ más" arriba a la derecha → "Mostrar original" — el campo **From** te lo dice.

## 2.6 Test rápido

Hacé que entre una transferencia chica a una de las billeteras (o mandate a vos mismo). Cuando llegue el mail, fijate que aparezca con la etiqueta **cobros**. Si aparece bien, listo.

## Listo

Anotate estos 3 valores:

```
GMAIL_USER         = tu-email@gmail.com
GMAIL_APP_PASSWORD = abcd efgh ijkl mnop
GMAIL_LABEL        = cobros
```

→ Seguí con [03-github.md](03-github.md).
