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
npm start             # producción: node dist/server.cjs
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
