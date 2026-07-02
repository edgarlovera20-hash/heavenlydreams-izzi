# Captura Express

PWA sencilla para uso personal en celular: sube identificaciones (INE, licencia de
conducir, cédula profesional, pasaporte, cartilla militar) y un comprobante de
domicilio, autorellena los datos del cliente vía OCR en el navegador, captura
coordenadas de ubicación y genera un texto con el detalle del paquete izzi
(tv+, wizz, Negocios, Residencial) elegido para copiarlo y enviarlo por
WhatsApp/SMS manualmente.

Es una app standalone: no depende de `@hd/core-*` ni de otros servicios del
ecosistema. No tiene login ni base de datos — todo el estado vive en el
IndexedDB del navegador del celular.

## Comandos

```bash
npm install
npm run dev          # tsx server.ts — puerto 3011
npm run typecheck    # tsc --noEmit
npm run build        # build:client (vite) + build:server (esbuild)
NODE_ENV=production npm start   # producción: node dist/server.cjs (requiere haber corrido build)
```

## Notas

- Los precios de `src/data/izziCatalog.ts` corresponden a los one-pagers de
  julio 2026. Verifícalos contra el material vigente antes de cotizar, ya que
  izzi actualiza precios y promociones cada mes.
- El OCR corre 100% en el navegador con `tesseract.js`; todos los campos
  autorellenados quedan editables porque licencias de conducir y cédulas
  profesionales varían de formato por estado/institución.
- El domicilio solo se marca como "validado" si hay coordenadas de GPS o de
  un link de Google Maps.

## Notas de producción

- **`NODE_ENV=production`** debe estar seteado al correr `npm start`, si no el
  servidor intenta levantar Vite en modo middleware (dev) y falla porque `dist/`
  no existe todavía o no aplica.
- **OCR self-hosted**: el core (`tesseract-core-lstm.wasm[.js]`) y el worker
  (`worker.min.js`) de `tesseract.js` se sirven desde `/tesseract-core/` (copiados
  de `node_modules` a `public/tesseract-core/`), no desde la CDN de jsDelivr —
  así el OCR no depende de un host externo con conectividad de campo inestable.
  Los datos de idioma (`spa`/`eng` `.traineddata`) sí se descargan la primera vez
  desde la CDN default de tesseract.js; el service worker los deja en caché para
  usos posteriores offline.
- **Carga diferida**: `tesseract.js` (~17KB del bundle) se importa dinámicamente
  en `src/lib/ocr.ts` — no se descarga hasta que el usuario captura su primer
  documento, para que la carga inicial de la app sea más rápida.
- **Liberación de memoria**: el worker de OCR se termina automáticamente tras 2
  minutos de inactividad (`OCR_IDLE_TIMEOUT_MS` en `src/lib/ocr.ts`), relevante
  en celulares con poca RAM.
- **Cache-Control**: `server.ts` sirve `index.html`/`manifest.json` con
  `no-cache` (para que un redeploy se refleje de inmediato) y los assets con
  hash de Vite + los binarios de `/tesseract-core/` con `Cache-Control: public,
  max-age=31536000, immutable`. También aplica `compression` (gzip) y headers
  básicos de seguridad (`X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`).
- **Service worker** (`public/sw.js`): cachea el app-shell y los binarios de OCR
  en la instalación, y usa network-first con fallback a caché para el resto —
  así la app (incluido el OCR) sigue funcionando sin señal después de la
  primera visita. Si cambias el contenido de `public/`, sube `CACHE_NAME` en
  `sw.js` para invalidar la caché vieja de los usuarios.
- **Iconos**: `public/icons/icon.svg` es la fuente; `icon-192.png`,
  `icon-512.png` y `apple-touch-icon.png` se generaron con `sharp` (herramienta
  usada una sola vez, no es dependencia del proyecto) porque Safari no soporta
  SVG en `apple-touch-icon`. Si cambias el logo, regenera los PNG con el mismo
  método antes de commitear.
