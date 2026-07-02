import { Camera, Check, ChevronDown, ChevronRight, IdCard, Loader2, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import { DOCUMENT_TYPE_LABELS, DocumentType, ParsedIdFields, parseByDocumentType } from "../lib/idParsers";
import { runOcr } from "../lib/ocr";
import type { CapturedDocument } from "../storage/db";

type IdentificacionKey = "ine" | "licencia_conducir" | "cedula_profesional" | "pasaporte" | "cartilla_militar";

const IDENTIFICACIONES: { key: IdentificacionKey; label: string; docs: DocumentType[] }[] = [
  { key: "ine", label: "INE", docs: ["ine_frontal", "ine_reverso"] },
  { key: "licencia_conducir", label: "Licencia de conducir", docs: ["licencia_conducir"] },
  { key: "cedula_profesional", label: "Cédula profesional", docs: ["cedula_profesional"] },
  { key: "pasaporte", label: "Pasaporte", docs: ["pasaporte"] },
  { key: "cartilla_militar", label: "Cartilla militar", docs: ["cartilla_militar"] },
];

const OTROS_DOCUMENTOS: DocumentType[] = ["comprobante_domicilio"];

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

function detectIdentificacionFromDocs(documentos: CapturedDocument[]): IdentificacionKey | "" {
  const types = new Set(documentos.map((doc) => doc.type));
  const found = IDENTIFICACIONES.find((item) => item.docs.some((doc) => types.has(doc)));
  return found?.key || "";
}

export function DocumentCapture(props: {
  documentos: CapturedDocument[];
  identificacionSeleccionada: string;
  onIdentificacionChange: (key: string) => void;
  onDocumentCaptured: (doc: CapturedDocument) => void;
  onFieldsExtracted: (type: DocumentType, fields: ParsedIdFields) => void;
}) {
  const [processingType, setProcessingType] = useState<DocumentType | null>(null);
  const [openRawText, setOpenRawText] = useState<DocumentType | null>(null);
  const [lastParsed, setLastParsed] = useState<Record<string, ParsedIdFields>>({});
  const [justSaved, setJustSaved] = useState<DocumentType | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const seleccionActual = (props.identificacionSeleccionada as IdentificacionKey) || detectIdentificacionFromDocs(props.documentos);
  const identificacion = IDENTIFICACIONES.find((item) => item.key === seleccionActual) || null;

  async function handleFile(type: DocumentType, file: File | undefined) {
    if (!file) return;
    setProcessingType(type);
    try {
      const dataUrl = await fileToDataUrl(file);
      props.onDocumentCaptured({ type, fileName: file.name, dataUrl, capturedAt: new Date().toISOString() });
      setJustSaved(type);
      setTimeout(() => setJustSaved((current) => (current === type ? null : current)), 2500);

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

  function CaptureRow({ type }: { type: DocumentType }) {
    const captured = documentFor(type);
    const parsed = lastParsed[type];
    const isProcessing = processingType === type;
    const badge = parsed ? CONFIDENCE_BADGE[parsed.confidence] : null;
    const showSaved = justSaved === type;

    return (
      <div className="ce-card-flat space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-[var(--ce-border-strong)] bg-black/20">
            {captured ? (
              <img src={captured.dataUrl} alt={DOCUMENT_TYPE_LABELS[type]} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[var(--ce-text-faint)]">
                <Camera className="h-4 w-4" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-snug text-[var(--ce-text)]">{DOCUMENT_TYPE_LABELS[type]}</p>
            {showSaved ? (
              <p className="flex items-center gap-1 text-xs font-semibold text-[var(--ce-success)]">
                <Check className="h-3 w-3" /> Guardado en tu celular
              </p>
            ) : captured ? (
              <p className="truncate text-xs text-[var(--ce-text-muted)]">{captured.fileName}</p>
            ) : (
              <p className="text-xs text-[var(--ce-text-faint)]">Sin capturar</p>
            )}
          </div>

          <button
            type="button"
            className="ce-btn ce-btn-secondary flex shrink-0 items-center gap-1.5 px-3"
            disabled={isProcessing}
            onClick={() => inputRefs.current[type]?.click()}
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            {captured ? "Cambiar" : "Guardar y subir"}
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
  }

  const totalDocs = (identificacion?.docs.length || 0) + OTROS_DOCUMENTOS.length;
  const capturedCount = [...(identificacion?.docs || []), ...OTROS_DOCUMENTOS].filter((type) => documentFor(type)).length;

  return (
    <div className="space-y-3">
      {!identificacion ? (
        <div className="space-y-2">
          <p className="ce-eyebrow px-1">Selecciona identificación</p>
          <div className="space-y-2">
            {IDENTIFICACIONES.map((item) => (
              <button
                key={item.key}
                type="button"
                className="ce-card-flat flex w-full items-center gap-3 text-left transition-colors hover:border-[var(--ce-primary)]"
                onClick={() => props.onIdentificacionChange(item.key)}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--ce-primary-soft)] text-[var(--ce-primary)]">
                  <IdCard className="h-4 w-4" />
                </span>
                <span className="flex-1 text-sm font-semibold text-[var(--ce-text)]">{item.label}</span>
                <ChevronRight className="h-4 w-4 text-[var(--ce-text-faint)]" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="ce-eyebrow">{identificacion.label}</p>
              <span className="ce-badge ce-badge-neutral">{capturedCount}/{totalDocs}</span>
            </div>
            <button
              type="button"
              className="flex items-center gap-1 text-xs font-semibold text-[var(--ce-text-faint)]"
              onClick={() => props.onIdentificacionChange("")}
            >
              <RotateCcw className="h-3 w-3" />
              Cambiar
            </button>
          </div>

          <div className="space-y-2">
            {identificacion.docs.map((type) => (
              <CaptureRow key={type} type={type} />
            ))}
          </div>

          <div className="pt-1">
            <p className="ce-eyebrow px-1">Ahora sube estos documentos</p>
          </div>
          <div className="space-y-2">
            {OTROS_DOCUMENTOS.map((type) => (
              <CaptureRow key={type} type={type} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
