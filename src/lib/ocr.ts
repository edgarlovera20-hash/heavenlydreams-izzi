import type { createWorker as CreateWorkerFn, Worker } from "tesseract.js";

// El core y el worker de tesseract.js se sirven desde nuestro propio origen
// (copiados a public/tesseract-core/ en build time) para no depender de un
// CDN externo en campo, donde la señal del vendedor puede ser inestable.
// Los datos de idioma (spa/eng .traineddata) sí se descargan de la CDN por
// default de tesseract.js la primera vez que se usa cada idioma; el service
// worker los deja en caché para los siguientes usos offline.
const CORE_PATH = "/tesseract-core/tesseract-core-lstm.wasm.js";
const WORKER_PATH = "/tesseract-core/worker.min.js";

const OCR_IDLE_TIMEOUT_MS = 2 * 60 * 1000;

let workerPromise: Promise<Worker> | null = null;
let idleTimer: ReturnType<typeof setTimeout> | null = null;

function clearIdleTimer() {
  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }
}

function scheduleIdleTermination() {
  clearIdleTimer();
  idleTimer = setTimeout(() => {
    terminateOcrWorker().catch(() => {});
  }, OCR_IDLE_TIMEOUT_MS);
}

async function getWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      const { createWorker } = (await import("tesseract.js")) as { createWorker: typeof CreateWorkerFn };
      return createWorker(["spa", "eng"], undefined, {
        corePath: CORE_PATH,
        workerPath: WORKER_PATH,
      });
    })();
  }
  return workerPromise;
}

// Reduce el tamano de la imagen y mejora contraste/escala de grises antes del OCR,
// lo que ayuda mucho a la precision del reconocimiento en fotos tomadas con el celular.
export async function preprocessImageFile(file: File, maxSide = 1600): Promise<Blob> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("No se pudo leer la imagen."));
      img.src = objectUrl;
    });

    const ratio = Math.min(1, maxSide / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * ratio));
    canvas.height = Math.max(1, Math.round(image.height * ratio));
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const contrast = 1.25;
    const midpoint = 128;
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      const adjusted = Math.min(255, Math.max(0, (gray - midpoint) * contrast + midpoint));
      data[i] = adjusted;
      data[i + 1] = adjusted;
      data[i + 2] = adjusted;
    }
    ctx.putImageData(imageData, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    return blob ?? file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function runOcr(file: File): Promise<string> {
  clearIdleTimer();
  try {
    const processed = await preprocessImageFile(file);
    const worker = await getWorker();
    const { data } = await worker.recognize(processed);
    return data.text || "";
  } catch (err) {
    // Un fallo de OCR no debe tumbar el flujo de captura: el usuario siempre
    // puede llenar los campos a mano.
    console.error("[ocr] runOcr fallo, se continua con captura manual", err);
    return "";
  } finally {
    scheduleIdleTermination();
  }
}

export async function terminateOcrWorker() {
  clearIdleTimer();
  if (!workerPromise) return;
  const pending = workerPromise;
  workerPromise = null;
  try {
    const worker = await pending;
    await worker.terminate();
  } catch {
    // ya se habia liberado o nunca termino de inicializar; no hay nada que hacer.
  }
}
