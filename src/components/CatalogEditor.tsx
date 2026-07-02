import { ChevronDown, Pencil, RotateCcw, Smartphone, Tv, Wifi } from "lucide-react";
import { useState } from "react";
import type { IzziLinea, PlanInternet, PlanMovil, PlanTv } from "../data/izziCatalog";
import type { GrupoExtrasOverride, MovilOverride, PlanOverride, WizzExtrasOverride } from "../storage/catalogOverrides";
import type { UseCatalogResult } from "../hooks/useCatalog";

type TabId = IzziLinea | "movil";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "tv", label: "izzi tv+", icon: <Tv className="h-4 w-4" /> },
  { id: "wizz", label: "wizz", icon: <Wifi className="h-4 w-4" /> },
  { id: "negocios", label: "Negocios", icon: <Wifi className="h-4 w-4" /> },
  { id: "residencial", label: "Residencial", icon: <Wifi className="h-4 w-4" /> },
  { id: "movil", label: "izzi móvil", icon: <Smartphone className="h-4 w-4" /> },
];

function NumberInput(props: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block space-y-1">
      <span className="ce-label">{props.label}</span>
      <input
        type="number"
        inputMode="numeric"
        className="ce-input"
        value={Number.isFinite(props.value) ? props.value : 0}
        onChange={(event) => props.onChange(Number(event.target.value) || 0)}
      />
    </label>
  );
}

function TextInput(props: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block space-y-1">
      <span className="ce-label">{props.label}</span>
      <input className="ce-input" value={props.value} placeholder={props.placeholder} onChange={(event) => props.onChange(event.target.value)} />
    </label>
  );
}

function isInternetPlan(plan: PlanInternet | PlanTv): plan is PlanInternet {
  return "velocidadMbps" in plan;
}

function PlanEditorRow(props: {
  plan: PlanInternet | PlanTv;
  isOverridden: boolean;
  onSave: (patch: PlanOverride) => void;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { plan } = props;
  const [draft, setDraft] = useState<PlanOverride>({
    nombre: plan.nombre,
    precioLista: plan.precioLista,
    precioPromocion: plan.precioPromocion,
    canales: plan.canales,
    ott: plan.ott,
    ...(isInternetPlan(plan)
      ? { descuentoMensual: plan.descuentoMensual, duracionDescuento: plan.duracionDescuento, megasAdicionalesX6Meses: plan.megasAdicionalesX6Meses }
      : { mesesPromocion: plan.mesesPromocion }),
  });

  return (
    <div className="ce-card-flat space-y-2">
      <button type="button" className="flex w-full items-center gap-2 text-left" onClick={() => setOpen((v) => !v)}>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--ce-text)]">{plan.nombre}</p>
          <p className="text-xs text-[var(--ce-text-muted)]">
            ${plan.precioPromocion}/mes {plan.precioPromocion !== plan.precioLista && <span className="line-through">${plan.precioLista}</span>}
          </p>
        </div>
        {props.isOverridden && <span className="ce-badge ce-badge-warning">Editado</span>}
        <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--ce-text-faint)] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="space-y-2.5 border-t border-[var(--ce-border)] pt-2.5">
          <TextInput label="Nombre" value={draft.nombre ?? plan.nombre} onChange={(v) => setDraft((d) => ({ ...d, nombre: v }))} />
          <div className="grid grid-cols-2 gap-2.5">
            <NumberInput label="Precio de lista" value={draft.precioLista ?? plan.precioLista} onChange={(v) => setDraft((d) => ({ ...d, precioLista: v }))} />
            <NumberInput label="Precio promoción" value={draft.precioPromocion ?? plan.precioPromocion} onChange={(v) => setDraft((d) => ({ ...d, precioPromocion: v }))} />
          </div>
          {isInternetPlan(plan) ? (
            <>
              <div className="grid grid-cols-2 gap-2.5">
                <NumberInput label="Descuento mensual" value={draft.descuentoMensual ?? plan.descuentoMensual} onChange={(v) => setDraft((d) => ({ ...d, descuentoMensual: v }))} />
                <TextInput label="Duración descuento" value={draft.duracionDescuento ?? plan.duracionDescuento} onChange={(v) => setDraft((d) => ({ ...d, duracionDescuento: v }))} placeholder="permanente / x6 meses" />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <NumberInput label="Canales" value={draft.canales ?? plan.canales ?? 0} onChange={(v) => setDraft((d) => ({ ...d, canales: v }))} />
                <NumberInput label="Megas adicionales x6m" value={draft.megasAdicionalesX6Meses ?? plan.megasAdicionalesX6Meses ?? 0} onChange={(v) => setDraft((d) => ({ ...d, megasAdicionalesX6Meses: v }))} />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              <NumberInput label="Canales" value={draft.canales ?? plan.canales} onChange={(v) => setDraft((d) => ({ ...d, canales: v }))} />
              <NumberInput label="Meses de promoción" value={draft.mesesPromocion ?? plan.mesesPromocion ?? 0} onChange={(v) => setDraft((d) => ({ ...d, mesesPromocion: v }))} />
            </div>
          )}
          <TextInput
            label="OTT incluidos (separados por coma)"
            value={(draft.ott ?? plan.ott).join(", ")}
            onChange={(v) => setDraft((d) => ({ ...d, ott: v.split(",").map((s) => s.trim()).filter(Boolean) }))}
          />
          <div className="flex gap-2 pt-1">
            <button type="button" className="ce-btn ce-btn-primary flex-1" onClick={() => props.onSave(draft)}>
              Guardar cambios
            </button>
            {props.isOverridden && (
              <button type="button" className="ce-btn ce-btn-secondary flex items-center gap-1.5 px-3" onClick={props.onReset}>
                <RotateCcw className="h-4 w-4" />
                Original
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MovilEditorRow(props: { plan: PlanMovil; isOverridden: boolean; onSave: (patch: MovilOverride) => void; onReset: () => void }) {
  const [open, setOpen] = useState(false);
  const { plan } = props;
  const [draft, setDraft] = useState<MovilOverride>({
    nombre: plan.nombre,
    precioSinServicioIzzi: plan.precioSinServicioIzzi,
    precioConServicioFijo: plan.precioConServicioFijo,
    promoEspecial: plan.promoEspecial ?? "",
    descuentoPortabilidad: plan.descuentoPortabilidad,
  });

  return (
    <div className="ce-card-flat space-y-2">
      <button type="button" className="flex w-full items-center gap-2 text-left" onClick={() => setOpen((v) => !v)}>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--ce-text)]">{plan.nombre}</p>
          <p className="text-xs text-[var(--ce-text-muted)]">{plan.precioConServicioFijo}/mes con servicio fijo</p>
        </div>
        {props.isOverridden && <span className="ce-badge ce-badge-warning">Editado</span>}
        <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--ce-text-faint)] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="space-y-2.5 border-t border-[var(--ce-border)] pt-2.5">
          <TextInput label="Nombre" value={draft.nombre ?? plan.nombre} onChange={(v) => setDraft((d) => ({ ...d, nombre: v }))} />
          <div className="grid grid-cols-2 gap-2.5">
            <TextInput label="Precio sin servicio izzi" value={draft.precioSinServicioIzzi ?? plan.precioSinServicioIzzi} onChange={(v) => setDraft((d) => ({ ...d, precioSinServicioIzzi: v }))} />
            <TextInput label="Precio con servicio fijo" value={draft.precioConServicioFijo ?? plan.precioConServicioFijo} onChange={(v) => setDraft((d) => ({ ...d, precioConServicioFijo: v }))} />
          </div>
          <TextInput label="Promoción especial" value={draft.promoEspecial ?? plan.promoEspecial ?? ""} onChange={(v) => setDraft((d) => ({ ...d, promoEspecial: v }))} placeholder="$99 x12 meses" />
          <NumberInput label="Descuento por portabilidad" value={draft.descuentoPortabilidad ?? plan.descuentoPortabilidad} onChange={(v) => setDraft((d) => ({ ...d, descuentoPortabilidad: v }))} />
          <div className="flex gap-2 pt-1">
            <button type="button" className="ce-btn ce-btn-primary flex-1" onClick={() => props.onSave(draft)}>
              Guardar cambios
            </button>
            {props.isOverridden && (
              <button type="button" className="ce-btn ce-btn-secondary flex items-center gap-1.5 px-3" onClick={props.onReset}>
                <RotateCcw className="h-4 w-4" />
                Original
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function CatalogEditor(props: { catalog: UseCatalogResult }) {
  const { catalog } = props;
  const [tab, setTab] = useState<TabId>("wizz");
  const [confirmReset, setConfirmReset] = useState(false);

  const [wizzDraft, setWizzDraft] = useState<WizzExtrasOverride>({});
  const [negociosDraft, setNegociosDraft] = useState<GrupoExtrasOverride>({});
  const [residencialDraft, setResidencialDraft] = useState<GrupoExtrasOverride>({});
  const [cargoTvDraft, setCargoTvDraft] = useState<number | null>(null);

  if (!catalog.loaded) {
    return <p className="px-1 text-sm text-[var(--ce-text-muted)]">Cargando catálogo…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="ce-card space-y-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--ce-primary-soft)] text-[var(--ce-primary)]">
            <Pencil className="h-4 w-4" />
          </span>
          <p className="ce-eyebrow">Editar catálogo</p>
        </div>
        <p className="text-xs text-[var(--ce-text-muted)]">
          Los cambios se guardan en este celular y se usan de inmediato al cotizar. izzi actualiza precios cada mes: revisa esta sección contra el
          one-pager vigente.
        </p>
        {catalog.hasAnyOverride && (
          <button
            type="button"
            className="ce-btn ce-btn-secondary flex w-full items-center justify-center gap-2"
            onClick={() => {
              if (confirmReset) {
                catalog.resetAll();
                setConfirmReset(false);
              } else {
                setConfirmReset(true);
              }
            }}
          >
            <RotateCcw className="h-4 w-4" />
            {confirmReset ? "¿Seguro? Toca de nuevo para restablecer todo" : "Restablecer todo a valores originales"}
          </button>
        )}
      </div>

      <div className="ce-scroll-x flex gap-2 pb-1">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold transition-colors " +
              (tab === item.id
                ? "border-[var(--ce-primary)] bg-[var(--ce-primary-soft)] text-[var(--ce-primary-hover)]"
                : "border-[var(--ce-border-strong)] bg-white/5 text-[var(--ce-text-muted)]")
            }
            onClick={() => setTab(item.id)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {tab === "tv" && (
        <div className="space-y-2">
          <div className="ce-card-flat space-y-2">
            <p className="ce-label">Cargo por instalación (pago único)</p>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <NumberInput label="Monto" value={cargoTvDraft ?? catalog.cargoInstalacionTv} onChange={setCargoTvDraft} />
              </div>
              <button type="button" className="ce-btn ce-btn-primary" onClick={() => cargoTvDraft !== null && catalog.updateCargoInstalacionTv(cargoTvDraft)}>
                Guardar
              </button>
            </div>
          </div>
          {catalog.planesTv.map((plan) => (
            <PlanEditorRow
              key={plan.id}
              plan={plan}
              isOverridden={Boolean(catalog.overrides.planes[plan.id])}
              onSave={(patch) => catalog.updatePlan(plan.id, patch)}
              onReset={() => catalog.resetPlan(plan.id)}
            />
          ))}
        </div>
      )}

      {(tab === "wizz" || tab === "negocios" || tab === "residencial") && (
        <div className="space-y-2">
          {tab === "wizz" && (
            <div className="ce-card-flat space-y-2.5">
              <p className="ce-label">Cargos y promociones — wizz</p>
              <div className="grid grid-cols-2 gap-2.5">
                <NumberInput label="Pago anticipado" value={wizzDraft.pagoAnticipado ?? catalog.wizzExtras.pagoAnticipado} onChange={(v) => setWizzDraft((d) => ({ ...d, pagoAnticipado: v }))} />
                <NumberInput label="Descuento domiciliar" value={wizzDraft.descuentoDomiciliar ?? catalog.wizzExtras.descuentoDomiciliar} onChange={(v) => setWizzDraft((d) => ({ ...d, descuentoDomiciliar: v }))} />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <NumberInput
                  label="Descuento portabilidad"
                  value={wizzDraft.descuentoPortabilidadTelefonica ?? catalog.wizzExtras.descuentoPortabilidadTelefonica}
                  onChange={(v) => setWizzDraft((d) => ({ ...d, descuentoPortabilidadTelefonica: v }))}
                />
                <NumberInput
                  label="Extensión TV desde 4to mes"
                  value={wizzDraft.extensionTvPrecioApartirCuartoMes ?? catalog.wizzExtras.extensionTv.precioApartirCuartoMes}
                  onChange={(v) => setWizzDraft((d) => ({ ...d, extensionTvPrecioApartirCuartoMes: v }))}
                />
              </div>
              <TextInput
                label="Texto de promoción de streaming"
                value={wizzDraft.streamingPromo ?? catalog.wizzExtras.streamingPromo}
                onChange={(v) => setWizzDraft((d) => ({ ...d, streamingPromo: v }))}
              />
              <button type="button" className="ce-btn ce-btn-primary w-full" onClick={() => catalog.updateWizzExtras(wizzDraft)}>
                Guardar cargos y promociones
              </button>
            </div>
          )}

          {(tab === "negocios" || tab === "residencial") &&
            (() => {
              const extras = tab === "negocios" ? catalog.negociosExtras : catalog.residencialExtras;
              const draft = tab === "negocios" ? negociosDraft : residencialDraft;
              const setDraft = tab === "negocios" ? setNegociosDraft : setResidencialDraft;
              const save = tab === "negocios" ? catalog.updateNegociosExtras : catalog.updateResidencialExtras;
              return (
                <div className="ce-card-flat space-y-2.5">
                  <p className="ce-label">Cargos y promociones — {tab === "negocios" ? "Negocios" : "Residencial"}</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <NumberInput label="Pago anticipado" value={draft.pagoAnticipadoMonto ?? extras.pagoAnticipado.monto} onChange={(v) => setDraft((d) => ({ ...d, pagoAnticipadoMonto: v }))} />
                    <NumberInput label="Descuento automatizar pago" value={draft.descuentoAutomatizarPago ?? extras.descuentoAutomatizarPago} onChange={(v) => setDraft((d) => ({ ...d, descuentoAutomatizarPago: v }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <NumberInput
                      label="Descuento portabilidad tel."
                      value={draft.descuentoPortabilidadTelefonica ?? extras.descuentoPortabilidadTelefonica}
                      onChange={(v) => setDraft((d) => ({ ...d, descuentoPortabilidadTelefonica: v }))}
                    />
                    <NumberInput
                      label="Extensión TV mensual"
                      value={draft.extensionTvPrecioMensual ?? extras.extensionTv.precioMensual}
                      onChange={(v) => setDraft((d) => ({ ...d, extensionTvPrecioMensual: v }))}
                    />
                  </div>
                  <TextInput
                    label="Condiciones pago anticipado"
                    value={draft.pagoAnticipadoCondiciones ?? extras.pagoAnticipado.condiciones}
                    onChange={(v) => setDraft((d) => ({ ...d, pagoAnticipadoCondiciones: v }))}
                  />
                  <div className="space-y-1.5">
                    <span className="ce-label">Descuento por portabilidad de internet</span>
                    {extras.descuentoPortabilidadInternetPorGrupo.map((grupo, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="flex-1 text-xs text-[var(--ce-text-muted)]">{grupo.grupo.join(", ")}</span>
                        <input
                          type="number"
                          className="ce-input w-24"
                          value={draft.portabilidadGrupoDescuentos?.[index] ?? grupo.descuento}
                          onChange={(event) =>
                            setDraft((d) => ({
                              ...d,
                              portabilidadGrupoDescuentos: { ...d.portabilidadGrupoDescuentos, [index]: Number(event.target.value) || 0 },
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <button type="button" className="ce-btn ce-btn-primary w-full" onClick={() => save(draft)}>
                    Guardar cargos y promociones
                  </button>
                </div>
              );
            })()}

          {catalog.getPlanesPorLinea(tab).map((plan) => (
            <PlanEditorRow
              key={plan.id}
              plan={plan}
              isOverridden={Boolean(catalog.overrides.planes[plan.id])}
              onSave={(patch) => catalog.updatePlan(plan.id, patch)}
              onReset={() => catalog.resetPlan(plan.id)}
            />
          ))}
        </div>
      )}

      {tab === "movil" && (
        <div className="space-y-2">
          {catalog.planesMovil.map((plan) => (
            <MovilEditorRow
              key={plan.id}
              plan={plan}
              isOverridden={Boolean(catalog.overrides.movil[plan.id])}
              onSave={(patch) => catalog.updateMovil(plan.id, patch)}
              onReset={() => catalog.resetMovil(plan.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
