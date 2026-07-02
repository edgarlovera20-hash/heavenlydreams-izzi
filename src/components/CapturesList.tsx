import { Plus, Trash2, User } from "lucide-react";
import { fullNameUpper } from "../lib/messageTemplate";
import type { ClientDraft } from "../storage/db";

export function CapturesList(props: { drafts: ClientDraft[]; onOpen: (id: string) => void; onDelete: (id: string) => void; onNew: () => void }) {
  return (
    <div className="space-y-3">
      <button type="button" className="ce-btn ce-btn-primary flex w-full items-center justify-center gap-2" onClick={props.onNew}>
        <Plus className="h-4 w-4" />
        Nueva captura
      </button>

      {props.drafts.length === 0 && <p className="text-center text-sm text-slate-500">Aún no tienes capturas guardadas.</p>}

      {props.drafts.map((draft) => (
        <div key={draft.id} className="ce-card flex items-center justify-between gap-3">
          <button type="button" className="flex flex-1 items-center gap-2 text-left" onClick={() => props.onOpen(draft.id)}>
            <User className="h-5 w-5 text-sky-400" />
            <div>
              <p className="text-sm font-semibold text-slate-100">{fullNameUpper(draft) || "Sin nombre"}</p>
              <p className="text-xs text-slate-500">{new Date(draft.updatedAt).toLocaleString("es-MX")}</p>
            </div>
          </button>
          <button type="button" onClick={() => props.onDelete(draft.id)} aria-label="Eliminar captura">
            <Trash2 className="h-4 w-4 text-rose-400" />
          </button>
        </div>
      ))}
    </div>
  );
}
