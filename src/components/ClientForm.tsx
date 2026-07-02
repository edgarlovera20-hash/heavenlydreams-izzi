import { CheckCircle2, Home, IdCard, Mail, MapPin, User, XCircle } from "lucide-react";
import { useState } from "react";
import { isValidCurpFormat } from "../lib/curp";
import { isValidRfcFormat } from "../lib/rfc";
import { formatCoords, isShortMapsLink, parseCoordsFromText } from "../lib/mapsCoords";
import { fullNameUpper, isDomicilioValidado } from "../lib/messageTemplate";
import type { ClientDraft } from "../storage/db";

function Field(props: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"] }) {
  return (
    <label className="block space-y-1.5">
      <span className="ce-label">{props.label}</span>
      <input
        className="ce-input"
        value={props.value}
        placeholder={props.placeholder}
        type={props.type || "text"}
        inputMode={props.inputMode}
        onChange={(event) => props.onChange(event.target.value)}
      />
    </label>
  );
}

function SectionHeading(props: { icon: React.ReactNode; title: string }) {
  return (
    <div className="mb-1 flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--ce-primary-soft)] text-[var(--ce-primary)]">{props.icon}</span>
      <p className="ce-eyebrow">{props.title}</p>
    </div>
  );
}

export function ClientForm(props: { draft: ClientDraft; onChange: (patch: Partial<ClientDraft>) => void }) {
  const { draft, onChange } = props;
  const [mapsLinkInput, setMapsLinkInput] = useState("");
  const [mapsLinkError, setMapsLinkError] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setMapsLinkError("Este navegador no soporta geolocalización.");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          lat: String(position.coords.latitude),
          lng: String(position.coords.longitude),
          fuenteCoordenadas: "gps",
        });
        setGeoLoading(false);
      },
      () => {
        setMapsLinkError("No se pudo obtener tu ubicación. Revisa el permiso de GPS.");
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function applyMapsLink(value: string) {
    setMapsLinkInput(value);
    setMapsLinkError("");
    if (!value.trim()) return;
    if (isShortMapsLink(value)) {
      setMapsLinkError("Es un link corto de Maps: pega el link largo o las coordenadas manualmente.");
      return;
    }
    const coords = parseCoordsFromText(value);
    if (!coords) {
      setMapsLinkError("No se reconocieron coordenadas en ese texto.");
      return;
    }
    onChange({ lat: String(coords.lat), lng: String(coords.lng), fuenteCoordenadas: "maps_link" });
  }

  const curpOk = draft.identificadorTipo === "curp" ? isValidCurpFormat(draft.curp) : true;
  const rfcOk = draft.identificadorTipo === "rfc" ? isValidRfcFormat(draft.rfc) : true;
  const domicilioValidado = isDomicilioValidado(draft);

  return (
    <div className="space-y-4">
      <div className="ce-card space-y-3">
        <SectionHeading icon={<User className="h-4 w-4" />} title="Nombre completo" />
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <Field label="Nombres" value={draft.nombres} onChange={(v) => onChange({ nombres: v })} placeholder="JUAN CARLOS" />
          <Field label="Apellido paterno" value={draft.apellidoPaterno} onChange={(v) => onChange({ apellidoPaterno: v })} placeholder="PEREZ" />
          <Field label="Apellido materno" value={draft.apellidoMaterno} onChange={(v) => onChange({ apellidoMaterno: v })} placeholder="GOMEZ" />
        </div>
        <p className="truncate rounded-lg bg-black/25 px-3 py-2 text-sm font-bold tracking-wide text-[var(--ce-primary-hover)]">
          {fullNameUpper(draft) || "—"}
        </p>
      </div>

      <div className="ce-card space-y-3">
        <SectionHeading icon={<IdCard className="h-4 w-4" />} title="Identificación fiscal" />
        <div className="flex gap-2">
          <button
            type="button"
            className={`ce-btn flex-1 ${draft.identificadorTipo === "curp" ? "ce-btn-primary" : "ce-btn-secondary"}`}
            onClick={() => onChange({ identificadorTipo: "curp" })}
          >
            CURP
          </button>
          <button
            type="button"
            className={`ce-btn flex-1 ${draft.identificadorTipo === "rfc" ? "ce-btn-primary" : "ce-btn-secondary"}`}
            onClick={() => onChange({ identificadorTipo: "rfc" })}
          >
            RFC
          </button>
        </div>
        {draft.identificadorTipo === "curp" ? (
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Field label="CURP del titular" value={draft.curp} onChange={(v) => onChange({ curp: v.toUpperCase() })} placeholder="XXXX000000XXXXXX00" />
            </div>
            {draft.curp && (curpOk ? <CheckCircle2 className="mb-3 h-5 w-5 shrink-0 text-[var(--ce-success)]" /> : <XCircle className="mb-3 h-5 w-5 shrink-0 text-[var(--ce-danger)]" />)}
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Field label="RFC del titular" value={draft.rfc} onChange={(v) => onChange({ rfc: v.toUpperCase() })} placeholder="XXXX000000XXX" />
            </div>
            {draft.rfc && (rfcOk ? <CheckCircle2 className="mb-3 h-5 w-5 shrink-0 text-[var(--ce-success)]" /> : <XCircle className="mb-3 h-5 w-5 shrink-0 text-[var(--ce-danger)]" />)}
          </div>
        )}
      </div>

      <div className="ce-card space-y-3">
        <SectionHeading icon={<Mail className="h-4 w-4" />} title="Contacto" />
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <Field label="Correo electrónico" value={draft.correo} onChange={(v) => onChange({ correo: v })} placeholder="cliente@correo.com" type="email" />
          <Field label="Teléfono del titular" value={draft.telefonoTitular} onChange={(v) => onChange({ telefonoTitular: v.replace(/\D/g, "").slice(0, 10) })} placeholder="5512345678" inputMode="tel" />
          <Field label="Teléfono de referencia" value={draft.telefonoReferencia} onChange={(v) => onChange({ telefonoReferencia: v.replace(/\D/g, "").slice(0, 10) })} placeholder="5587654321" inputMode="tel" />
        </div>
      </div>

      <div className="ce-card space-y-3">
        <SectionHeading icon={<Home className="h-4 w-4" />} title="Dirección completa" />
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <Field label="Calle" value={draft.calle} onChange={(v) => onChange({ calle: v })} />
          <Field label="Número exterior" value={draft.numeroExterior} onChange={(v) => onChange({ numeroExterior: v })} />
          <Field label="Número interior" value={draft.numeroInterior} onChange={(v) => onChange({ numeroInterior: v })} />
          <Field label="Colonia" value={draft.colonia} onChange={(v) => onChange({ colonia: v })} />
          <Field label="Código postal" value={draft.codigoPostal} onChange={(v) => onChange({ codigoPostal: v.replace(/\D/g, "").slice(0, 5) })} inputMode="numeric" />
          <Field label="Municipio" value={draft.municipio} onChange={(v) => onChange({ municipio: v })} />
        </div>
      </div>

      <div className="ce-card space-y-3">
        <SectionHeading icon={<MapPin className="h-4 w-4" />} title="Coordenadas / ubicación" />
        <button type="button" className="ce-btn ce-btn-secondary flex items-center justify-center gap-2" onClick={useCurrentLocation} disabled={geoLoading}>
          <MapPin className="h-4 w-4" />
          {geoLoading ? "Obteniendo ubicación..." : "Usar mi ubicación actual"}
        </button>
        <Field
          label="O pega un link de Google Maps"
          value={mapsLinkInput}
          onChange={applyMapsLink}
          placeholder="https://maps.google.com/?q=19.4326,-99.1332"
        />
        {mapsLinkError && <p className="text-xs text-[var(--ce-danger)]">{mapsLinkError}</p>}
        {draft.lat && draft.lng && <p className="text-xs text-[var(--ce-text-muted)]">Coordenadas: {formatCoords(Number(draft.lat), Number(draft.lng))}</p>}

        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
          style={{
            background: domicilioValidado ? "var(--ce-success-soft)" : "var(--ce-danger-soft)",
            color: domicilioValidado ? "#6ee7b7" : "#fda4af",
          }}
        >
          {domicilioValidado ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {domicilioValidado ? "Domicilio validado" : "Domicilio NO validado (faltan coordenadas)"}
        </div>
      </div>
    </div>
  );
}
