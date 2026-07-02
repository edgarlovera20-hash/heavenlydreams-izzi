import { Camera, ChevronDown, ImageOff, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { DOCUMENT_TYPE_LABELS, DocumentType, ParsedIdFields, parseByDocumentType } from "../lib/idParsers";
import { runOcr } from "../lib/ocr";
import type { CapturedDocument } from "../storage/db";

const DOCUMENT_TYPES: DocumentType[] = [
  "ine_frontal",
  "ine_reverso",
  "licencia_conducir",
  "cedula_profesional",
  "pasaporte",
  "cartilla_militar",
  "comprobante_domicilio",
];

const CONFIDENCE_BADGE: Record<ParsedIdFields["confidence"], { label: string; className: string }> = {
  alta: { label: "Lectura confiable", className: "ce-badge-success" },
  media: { label: "Revisa los datos", className: "ce-badge-warning" },
  baja: { label: "Llena a mano", className: "ce-badge-danger" },
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("No se pudo leer el archivo."));
    reader.readAsDataURL(file);
  });
}

export function DocumentCapture(props: {
  documentos: CapturedDocument[];
  onDocumentCaptured: (doc: CapturedDocument) => void;
  onFieldsExtracted: (type: DocumentType, fields: ParsedIdFields) => void;
}) {
  const [processingType, setProcessingType] = useState<DocumentType | null>(null);
  const [openRawText, setOpenRawText] = useState<DocumentType | null>(null);
  const [lastParsed, setLastParsed] = useState<Record<string, ParsedIdFields>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  async function handleFile(type: DocumentType, file: File | undefined) {
    if (!file) return;
    setProcessingType(type);
    try {
      const dataUrl = await fileToDataUrl(file);
      props.onDocumentCaptured({ type, fileName: file.name, dataUrl, capturedAt: new Date().toISOString() });

      const rawText = await runOcr(file);
      const parsed = parseByDocumentType(type, rawText);
      setLastParsed((prev) => ({ ...prev, [type]: parsed }));
      props.onFieldsExtracted(type, parsed);
    } catch (err) {
      console.error("[DocumentCapture] OCR error", err);
    } finally {
      setProcessingType(null);
    }
  }

  function documentFor(type: DocumentType) {
    return props.documentos.find((doc) => doc.type === type);
  }

  const capturedCount = DOCUMENT_TYPES.filter((type) => documentFor(type)).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="ce-eyebrow">Documentos del cliente</p>
        <span className="ce-badge ce-badge-neutral">{capturedCount}/{DOCUMENT_TYPES.length} subidos</span>
      </div>

      {DOCUMENT_TYPES.map((type) => {
        const captured = documentFor(type);
        const parsed = lastParsed[type];
        const isProcessing = processingType === type;
        const badge = parsed ? CONFIDENCE_BADGE[parsed.confidence] : null;

        return (
          <div key={type} className="ce-card space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[var(--ce-border-strong)] bg-black/20">
                {captured ? (
                  <img src={captured.dataUrl} alt={DOCUMENT_TYPE_LABELS[type]} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[var(--ce-text-faint)]">
                    <ImageOff className="h-5 w-5" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-snug text-[var(--ce-text)]">{DOCUMENT_TYPE_LABELS[type]}</p>
                {captured ? (
                  <p className="truncate text-xs text-[var(--ce-text-muted)]">{captured.fileName}</p>
                ) : (
                  <p className="text-xs text-[var(--ce-text-faint)]">Sin capturar</p>
                )}
              </div>

              <button
                type="button"
                className="ce-btn ce-btn-secondary flex shrink-0 items-center gap-2 px-3"
                disabled={isProcessing}
                onClick={() => inputRefs.current[type]?.click()}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                {captured ? "Cambiar" : "Capturar"}
              </button>
              <input
                ref={(el) => {
                  inputRefs.current[type] = el;
                }}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(event) => handleFile(type, event.target.files?.[0])}
              />
            </div>

            {isProcessing && (
              <div className="flex items-center gap-2 rounded-lg bg-[var(--ce-primary-soft)] px-2.5 py-1.5 text-xs font-medium text-[var(--ce-primary-hover)]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Leyendo el documento…
              </div>
            )}

            {badge && !isProcessing && (
              <div className="flex items-center justify-between gap-2">
                <span className={`ce-badge ${badge.className}`}>{badge.label}</span>
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs text-[var(--ce-text-faint)]"
                  onClick={() => setOpenRawText(openRawText === type ? null : type)}
                >
                  <ChevronDown className={`h-3 w-3 transition-transform ${openRawText === type ? "rotate-180" : ""}`} />
                  Texto detectado
                </button>
              </div>
            )}

            {openRawText === type && parsed && (
              <pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded-lg bg-black/30 p-2 text-[10px] text-[var(--ce-text-faint)]">
                {parsed.rawText || "(sin texto detectado)"}
              </pre>
            )}
          </div>
        );
      })}
    </div>
  );
}
