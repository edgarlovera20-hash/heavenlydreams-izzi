import { Camera, CheckCircle2, ChevronDown, Loader2 } from "lucide-react";
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

  return (
    <div className="space-y-3">
      <p className="ce-label">Sube o toma foto de cada documento</p>
      {DOCUMENT_TYPES.map((type) => {
        const captured = documentFor(type);
        const parsed = lastParsed[type];
        const isProcessing = processingType === type;
        return (
          <div key={type} className="ce-card space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {captured ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : (
                  <Camera className="h-5 w-5 text-slate-400" />
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-100">{DOCUMENT_TYPE_LABELS[type]}</p>
                  {captured && <p className="text-xs text-slate-400">{captured.fileName}</p>}
                </div>
              </div>
              <button
                type="button"
                className="ce-btn ce-btn-secondary flex items-center gap-2"
                disabled={isProcessing}
                onClick={() => inputRefs.current[type]?.click()}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {captured ? "Reemplazar" : "Capturar"}
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

            {parsed && (
              <div className="rounded-lg bg-slate-900/60 p-2 text-xs">
                <p className={parsed.confidence === "alta" ? "text-emerald-400" : parsed.confidence === "media" ? "text-amber-400" : "text-rose-400"}>
                  Confianza de lectura: {parsed.confidence}
                </p>
                <button
                  type="button"
                  className="mt-1 flex items-center gap-1 text-slate-400"
                  onClick={() => setOpenRawText(openRawText === type ? null : type)}
                >
                  <ChevronDown className={`h-3 w-3 transition-transform ${openRawText === type ? "rotate-180" : ""}`} />
                  Ver texto detectado
                </button>
                {openRawText === type && (
                  <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap text-[10px] text-slate-500">
                    {parsed.rawText}
                  </pre>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
