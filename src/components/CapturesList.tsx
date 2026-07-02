import { FolderOpen, Plus, Trash2 } from "lucide-react";
import { fullNameUpper } from "../lib/messageTemplate";
import type { ClientDraft } from "../storage/db";

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

export function CapturesList(props: { drafts: ClientDraft[]; onOpen: (id: string) => void; onDelete: (id: string) => void; onNew: () => void }) {
  return (
    <div className="space-y-4">
      <button type="button" className="ce-btn ce-btn-primary flex w-full items-center justify-center gap-2" onClick={props.onNew}>
        <Plus className="h-4 w-4" />
        Nueva captura
      </button>

      {props.drafts.length === 0 ? (
        <div className="ce-card flex flex-col items-center gap-2 py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-[var(--ce-text-faint)]">
            <FolderOpen className="h-6 w-6" />
          </span>
          <p className="text-sm font-semibold text-[var(--ce-text)]">Aún no tienes capturas guardadas</p>
          <p className="max-w-[220px] text-xs text-[var(--ce-text-muted)]">Toca "Nueva captura" para empezar con la primera identificación del cliente.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="ce-eyebrow px-1">Capturas guardadas</p>
          {props.drafts.map((draft) => {
            const name = fullNameUpper(draft);
            return (
              <div key={draft.id} className="ce-card-flat flex items-center gap-3">
                <button type="button" className="flex flex-1 items-center gap-3 text-left" onClick={() => props.onOpen(draft.id)}>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--ce-primary-soft)] text-sm font-bold text-[var(--ce-primary-hover)]">
                    {initialsFor(name || "Sin nombre")}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--ce-text)]">{name || "Sin nombre"}</p>
                    <p className="text-xs text-[var(--ce-text-faint)]">{new Date(draft.updatedAt).toLocaleString("es-MX")}</p>
                  </div>
                </button>
                <button
                  type="button"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--ce-text-faint)] hover:bg-[var(--ce-danger-soft)] hover:text-[var(--ce-danger)]"
                  onClick={() => props.onDelete(draft.id)}
                  aria-label="Eliminar captura"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
