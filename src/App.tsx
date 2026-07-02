import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { CapturesList } from "./components/CapturesList";
import { ClientForm } from "./components/ClientForm";
import { DocumentCapture } from "./components/DocumentCapture";
import { PackageSelector } from "./components/PackageSelector";
import { SummaryScreen } from "./components/SummaryScreen";
import { CARGO_INSTALACION_TV, IzziLinea, PLANES_TV, planesPorLinea } from "./data/izziCatalog";
import type { ParsedIdFields } from "./lib/idParsers";
import { buildClientMessage } from "./lib/messageTemplate";
import { CapturedDocument, ClientDraft, deleteDraft, emptyDraft, listDrafts, loadDraft, saveDraft } from "./storage/db";

type Step = "lista" | "documentos" | "cliente" | "paquete" | "resumen";

const STEP_LABELS: Record<Exclude<Step, "lista">, string> = {
  documentos: "1. Documentos",
  cliente: "2. Datos del cliente",
  paquete: "3. Paquete izzi",
  resumen: "4. Resumen",
};

export default function App() {
  const [step, setStep] = useState<Step>("lista");
  const [drafts, setDrafts] = useState<ClientDraft[]>([]);
  const [draft, setDraft] = useState<ClientDraft | null>(null);
  const [linea, setLinea] = useState<IzziLinea>("wizz");

  useEffect(() => {
    refreshDrafts();
  }, []);

  async function refreshDrafts() {
    setDrafts(await listDrafts());
  }

  function patchDraft(patch: Partial<ClientDraft>) {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  async function persist(next: ClientDraft) {
    const saved = await saveDraft(next);
    setDraft(saved);
  }

  useEffect(() => {
    if (draft) {
      const timeout = setTimeout(() => {
        saveDraft(draft);
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [draft]);

  function startNewCapture() {
    setDraft(emptyDraft());
    setLinea("wizz");
    setStep("documentos");
  }

  async function openCapture(id: string) {
    const found = await loadDraft(id);
    if (found) {
      setDraft(found);
      setStep("documentos");
    }
  }

  async function removeCapture(id: string) {
    await deleteDraft(id);
    refreshDrafts();
  }

  function handleDocumentCaptured(doc: CapturedDocument) {
    setDraft((prev) => (prev ? { ...prev, documentos: [...prev.documentos.filter((d) => d.type !== doc.type), doc] } : prev));
  }

  function handleFieldsExtracted(_type: string, fields: ParsedIdFields) {
    const patch: Partial<ClientDraft> = {};
    if (fields.nombres) patch.nombres = fields.nombres;
    if (fields.apellidoPaterno) patch.apellidoPaterno = fields.apellidoPaterno;
    if (fields.apellidoMaterno) patch.apellidoMaterno = fields.apellidoMaterno;
    if (fields.curp) {
      patch.curp = fields.curp;
      patch.identificadorTipo = "curp";
    }
    if (fields.rfc) {
      patch.rfc = fields.rfc;
      if (!fields.curp) patch.identificadorTipo = "rfc";
    }
    if (fields.calle) patch.calle = fields.calle;
    if (fields.colonia) patch.colonia = fields.colonia;
    if (fields.codigoPostal) patch.codigoPostal = fields.codigoPostal;
    patchDraft(patch);
  }

  function goBack() {
    if (step === "documentos") {
      setStep("lista");
      refreshDrafts();
    } else if (step === "cliente") setStep("documentos");
    else if (step === "paquete") setStep("cliente");
    else if (step === "resumen") setStep("paquete");
  }

  function goNext() {
    if (!draft) return;
    if (step === "documentos") setStep("cliente");
    else if (step === "cliente") setStep("paquete");
    else if (step === "paquete") {
      const plan = linea === "tv" ? PLANES_TV.find((p) => p.id === draft.planSeleccionadoId) : planesPorLinea(linea).find((p) => p.id === draft.planSeleccionadoId);
      if (!plan) return;
      const cargoInstalacion = linea === "tv" ? CARGO_INSTALACION_TV : undefined;
      const mensaje = buildClientMessage(draft, plan, draft.addonsSeleccionados, cargoInstalacion);
      const next = { ...draft, mensajeGenerado: mensaje };
      setDraft(next);
      persist(next);
      setStep("resumen");
    }
  }

  const canAdvance = step === "documentos" || step === "cliente" || (step === "paquete" && Boolean(draft?.planSeleccionadoId));

  return (
    <div className="mx-auto min-h-screen max-w-md px-4 py-6">
      <header className="mb-4">
        <h1 className="text-lg font-bold text-slate-100">Captura Express</h1>
        {step !== "lista" && <p className="text-xs text-slate-500">{STEP_LABELS[step]}</p>}
      </header>

      {step === "lista" && <CapturesList drafts={drafts} onOpen={openCapture} onDelete={removeCapture} onNew={startNewCapture} />}

      {step === "documentos" && draft && (
        <DocumentCapture documentos={draft.documentos} onDocumentCaptured={handleDocumentCaptured} onFieldsExtracted={handleFieldsExtracted} />
      )}

      {step === "cliente" && draft && <ClientForm draft={draft} onChange={patchDraft} />}

      {step === "paquete" && draft && (
        <PackageSelector
          linea={linea}
          planId={draft.planSeleccionadoId}
          addonsSeleccionados={draft.addonsSeleccionados}
          onLineaChange={setLinea}
          onPlanChange={(planSeleccionadoId) => patchDraft({ planSeleccionadoId })}
          onAddonsChange={(addonsSeleccionados) => patchDraft({ addonsSeleccionados })}
        />
      )}

      {step === "resumen" && draft && <SummaryScreen mensaje={draft.mensajeGenerado} />}

      {step !== "lista" && (
        <div className="mt-5 flex gap-2">
          <button type="button" className="ce-btn ce-btn-secondary flex flex-1 items-center justify-center gap-2" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
            Atrás
          </button>
          {step !== "resumen" && (
            <button type="button" className="ce-btn ce-btn-primary flex flex-1 items-center justify-center gap-2" disabled={!canAdvance} onClick={goNext}>
              Siguiente
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
