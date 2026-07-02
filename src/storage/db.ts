import { del, get, keys, set } from "idb-keyval";
import type { DocumentType } from "../lib/idParsers";

export type CapturedDocument = {
  type: DocumentType;
  fileName: string;
  dataUrl: string;
  capturedAt: string;
};

export type ClientDraft = {
  id: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  identificadorTipo: "curp" | "rfc";
  curp: string;
  rfc: string;
  correo: string;
  telefonoTitular: string;
  telefonoReferencia: string;
  calle: string;
  numeroExterior: string;
  numeroInterior: string;
  colonia: string;
  codigoPostal: string;
  municipio: string;
  lat: string;
  lng: string;
  fuenteCoordenadas: "gps" | "maps_link" | "";
  planSeleccionadoId: string;
  addonsSeleccionados: string[];
  documentos: CapturedDocument[];
  mensajeGenerado: string;
  createdAt: string;
  updatedAt: string;
};

const CAPTURE_PREFIX = "captura_express_v1:";

export function newDraftId() {
  return `cap_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyDraft(): ClientDraft {
  const now = new Date().toISOString();
  return {
    id: newDraftId(),
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    identificadorTipo: "curp",
    curp: "",
    rfc: "",
    correo: "",
    telefonoTitular: "",
    telefonoReferencia: "",
    calle: "",
    numeroExterior: "",
    numeroInterior: "",
    colonia: "",
    codigoPostal: "",
    municipio: "",
    lat: "",
    lng: "",
    fuenteCoordenadas: "",
    planSeleccionadoId: "",
    addonsSeleccionados: [],
    documentos: [],
    mensajeGenerado: "",
    createdAt: now,
    updatedAt: now,
  };
}

export async function saveDraft(draft: ClientDraft) {
  const updated: ClientDraft = { ...draft, updatedAt: new Date().toISOString() };
  await set(`${CAPTURE_PREFIX}${draft.id}`, updated);
  return updated;
}

export async function loadDraft(id: string): Promise<ClientDraft | null> {
  const value = await get(`${CAPTURE_PREFIX}${id}`);
  return value ?? null;
}

export async function deleteDraft(id: string) {
  await del(`${CAPTURE_PREFIX}${id}`);
}

export async function listDrafts(): Promise<ClientDraft[]> {
  const allKeys = await keys();
  const captureKeys = allKeys.filter((key) => String(key).startsWith(CAPTURE_PREFIX));
  const drafts = await Promise.all(captureKeys.map((key) => get(key as string)));
  return (drafts.filter(Boolean) as ClientDraft[]).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
