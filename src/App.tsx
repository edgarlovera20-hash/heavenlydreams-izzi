import { ArrowLeft, ArrowRight, Settings, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { CapturesList } from "./components/CapturesList";
import { CatalogEditor } from "./components/CatalogEditor";
import { ClientForm } from "./components/ClientForm";
import { DocumentCapture } from "./components/DocumentCapture";
import { PackageSelector } from "./components/PackageSelector";
import { SummaryScreen } from "./components/SummaryScreen";
import { WizardSteps } from "./components/WizardSteps";
import { IzziLinea } from "./data/izziCatalog";
import { useCatalog } from "./hooks/useCatalog";
import type { ParsedIdFields } from "./lib/idParsers";
import { buildClientMessage } from "./lib/messageTemplate";
import { CapturedDocument, ClientDraft, deleteDraft, emptyDraft, listDrafts, loadDraft, saveDraft } from "./storage/db";

type Step = "lista" | "documentos" | "cliente" | "paquete" | "resumen" | "catalogo";
type WizardStep = "documentos" | "cliente" | "paquete" | "resumen";

const WIZARD_STEPS: WizardStep[] = ["documentos", "cliente", "paquete", "resumen"];
const STEP_LABELS: Record<WizardStep, string> = {
  documentos: "Documentos",
  cliente: "Cliente",
  paquete: "Paquete",
  resumen: "Resumen",
};

function isWizardStep(step: Step): step is WizardStep {
  return (WIZARD_STEPS as Step[]).includes(step);
}

export default function App() {
  const [step, setStep] = useState<Step>("lista");
  const [drafts, setDrafts] = useState<ClientDraft[]>([]);
  const [draft, setDraft] = useState<ClientDraft | null>(null);
  const [linea, setLinea] = useState<IzziLinea>("wizz");
  const catalog = useCatalog();

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
    if (step === "catalogo") {
      setStep("lista");
    } else if (step === "documentos") {
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
      const plan = linea === "tv" ? catalog.planesTv.find((p) => p.id === draft.planSeleccionadoId) : catalog.getPlanesPorLinea(linea).find((p) => p.id === draft.planSeleccionadoId);
      if (!plan) return;
      const cargoInstalacion = linea === "tv" ? catalog.cargoInstalacionTv : undefined;
      const mensaje = buildClientMessage(draft, plan, draft.addonsSeleccionados, cargoInstalacion);
      const next = { ...draft, mensajeGenerado: mensaje };
      setDraft(next);
      persist(next);
      setStep("resumen");
    }
  }

  const canAdvance = step === "documentos" || step === "cliente" || (step === "paquete" && Boolean(draft?.planSeleccionadoId));
  const wizardIndex = isWizardStep(step) ? WIZARD_STEPS.indexOf(step) : -1;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="sticky top-0 z-10 border-b border-[var(--ce-border)] bg-[var(--ce-bg)]/85 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--ce-primary-soft)] text-[var(--ce-primary)]">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <h1 className="ce-title leading-none">Captura Express</h1>
            {isWizardStep(step) && <p className="ce-subtitle mt-0.5">Paso {wizardIndex + 1} de {WIZARD_STEPS.length}</p>}
            {step === "catalogo" && <p className="ce-subtitle mt-0.5">Paquetes y promociones</p>}
          </div>
          {step === "lista" && (
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--ce-text-muted)] hover:bg-white/5"
              onClick={() => setStep("catalogo")}
              aria-label="Editar catálogo"
            >
              <Settings className="h-5 w-5" />
            </button>
          )}
        </div>
        {isWizardStep(step) && (
          <div className="mt-3">
            <WizardSteps labels={WIZARD_STEPS.map((s) => STEP_LABELS[s])} currentIndex={wizardIndex} />
          </div>
        )}
      </header>

      <main className="flex-1 px-4 py-4 pb-28">
        {step === "lista" && <CapturesList drafts={drafts} onOpen={openCapture} onDelete={removeCapture} onNew={startNewCapture} />}

        {step === "catalogo" && <CatalogEditor catalog={catalog} />}

        {step === "documentos" && draft && (
          <DocumentCapture
            documentos={draft.documentos}
            identificacionSeleccionada={draft.identificacionSeleccionada}
            onIdentificacionChange={(identificacionSeleccionada) => patchDraft({ identificacionSeleccionada })}
            onDocumentCaptured={handleDocumentCaptured}
            onFieldsExtracted={handleFieldsExtracted}
          />
        )}

        {step === "cliente" && draft && <ClientForm draft={draft} onChange={patchDraft} />}

        {step === "paquete" && draft && (
          <PackageSelector
            linea={linea}
            planId={draft.planSeleccionadoId}
            addonsSeleccionados={draft.addonsSeleccionados}
            catalog={catalog}
            onLineaChange={setLinea}
            onPlanChange={(planSeleccionadoId) => patchDraft({ planSeleccionadoId })}
            onAddonsChange={(addonsSeleccionados) => patchDraft({ addonsSeleccionados })}
          />
        )}

        {step === "resumen" && draft && <SummaryScreen mensaje={draft.mensajeGenerado} />}
      </main>

      {step !== "lista" && (
        <div className="sticky bottom-0 z-10 border-t border-[var(--ce-border)] bg-[var(--ce-bg)]/90 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
          <div className="flex gap-2">
            <button type="button" className="ce-btn ce-btn-secondary flex flex-1 items-center justify-center gap-2" onClick={goBack}>
              <ArrowLeft className="h-4 w-4" />
              Atrás
            </button>
            {isWizardStep(step) && step !== "resumen" && (
              <button type="button" className="ce-btn ce-btn-primary flex flex-[2] items-center justify-center gap-2" disabled={!canAdvance} onClick={goNext}>
                Siguiente
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
            {step === "resumen" && (
              <button
                type="button"
                className="ce-btn ce-btn-primary flex flex-[2] items-center justify-center gap-2"
                onClick={() => {
                  setStep("lista");
                  refreshDrafts();
                }}
              >
                Terminar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
