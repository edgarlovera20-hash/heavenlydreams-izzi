import { Check, Smartphone, Sparkles, Tv, Wifi } from "lucide-react";
import {
  CARGO_INSTALACION_TV,
  IzziLinea,
  NEGOCIOS_EXTRAS,
  PLANES_IZZI_MOVIL,
  PLANES_TV,
  RESIDENCIAL_EXTRAS,
  WIZZ_EXTRAS,
  planesPorLinea,
} from "../data/izziCatalog";

const LINEAS: { id: IzziLinea; label: string; icon: React.ReactNode }[] = [
  { id: "tv", label: "izzi tv+", icon: <Tv className="h-4 w-4" /> },
  { id: "wizz", label: "wizz", icon: <Wifi className="h-4 w-4" /> },
  { id: "negocios", label: "Negocios", icon: <Wifi className="h-4 w-4" /> },
  { id: "residencial", label: "Residencial", icon: <Wifi className="h-4 w-4" /> },
];

function addonOptionsFor(linea: IzziLinea, planId: string): string[] {
  const options: string[] = [];
  if (linea === "wizz") {
    options.push(`Pago anticipado: $${WIZZ_EXTRAS.pagoAnticipado} de descuento inicial`);
    options.push(`Descuento por domiciliar pago: -$${WIZZ_EXTRAS.descuentoDomiciliar}/mes`);
    options.push(`Descuento por portabilidad telefónica: -$${WIZZ_EXTRAS.descuentoPortabilidadTelefonica}/mes`);
    options.push(WIZZ_EXTRAS.streamingPromo);
    options.push(
      `Extensión de TV: gratis los primeros ${WIZZ_EXTRAS.extensionTv.gratisPrimerosMeses} meses, luego $${WIZZ_EXTRAS.extensionTv.precioApartirCuartoMes}/mes (2da y 3ra extensión $${WIZZ_EXTRAS.extensionTv.segundaTerceraExtension}/mes c/u, ${WIZZ_EXTRAS.extensionTv.nota})`
    );
  }
  if (linea === "negocios" || linea === "residencial") {
    const extras = linea === "negocios" ? NEGOCIOS_EXTRAS : RESIDENCIAL_EXTRAS;
    options.push(`Pago anticipado: $${extras.pagoAnticipado.monto} — ${extras.pagoAnticipado.condiciones}`);
    options.push(`Descuento por automatizar pago: -$${extras.descuentoAutomatizarPago}/mes`);
    options.push(`Descuento por portabilidad telefónica: -$${extras.descuentoPortabilidadTelefonica}/mes`);
    options.push(`Extensión de TV: $${extras.extensionTv.precioMensual}/mes c/u (máximo ${extras.extensionTv.maximoPorPaquete} por paquete)`);
    const grupo = extras.descuentoPortabilidadInternetPorGrupo.find((g) => g.grupo.includes(planId));
    if (grupo) options.push(`Descuento por portabilidad de internet: -$${grupo.descuento}/mes`);
  }
  return options;
}

export function PackageSelector(props: {
  linea: IzziLinea;
  planId: string;
  addonsSeleccionados: string[];
  onLineaChange: (linea: IzziLinea) => void;
  onPlanChange: (planId: string) => void;
  onAddonsChange: (addons: string[]) => void;
}) {
  const { linea, planId, addonsSeleccionados } = props;
  const planesInternet = linea === "tv" ? [] : planesPorLinea(linea);
  const addonOptions = planId ? addonOptionsFor(linea, planId) : [];

  function toggleAddon(addon: string) {
    if (addonsSeleccionados.includes(addon)) {
      props.onAddonsChange(addonsSeleccionados.filter((item) => item !== addon));
    } else {
      props.onAddonsChange([...addonsSeleccionados, addon]);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="ce-eyebrow px-1">Línea de negocio</p>
        <div className="ce-scroll-x flex gap-2 pb-1">
          {LINEAS.map((item) => {
            const active = linea === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={
                  "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold transition-colors " +
                  (active
                    ? "border-[var(--ce-primary)] bg-[var(--ce-primary-soft)] text-[var(--ce-primary-hover)]"
                    : "border-[var(--ce-border-strong)] bg-white/5 text-[var(--ce-text-muted)]")
                }
                onClick={() => {
                  props.onLineaChange(item.id);
                  props.onPlanChange("");
                  props.onAddonsChange([]);
                }}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="ce-eyebrow px-1">Paquete</p>
        <div className="space-y-2">
          {linea === "tv"
            ? PLANES_TV.map((plan) => {
                const active = planId === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    className={
                      "w-full rounded-xl border p-3.5 text-left transition-colors " +
                      (active ? "border-[var(--ce-primary)] bg-[var(--ce-primary-soft)]" : "border-[var(--ce-border)] bg-[var(--ce-surface)]")
                    }
                    onClick={() => props.onPlanChange(plan.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-[var(--ce-text)]">{plan.nombre}</p>
                        <p className="text-xs text-[var(--ce-text-muted)]">{plan.canales} canales{plan.ott.length ? ` · ${plan.ott.join(", ")}` : ""}</p>
                      </div>
                      {active && (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--ce-primary)] text-white">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-lg font-extrabold text-[var(--ce-primary-hover)]">
                      ${plan.precioPromocion}
                      <span className="text-xs font-medium text-[var(--ce-text-faint)]"> /mes</span>
                      {plan.precioPromocion !== plan.precioLista && (
                        <span className="ml-2 text-xs font-medium text-[var(--ce-text-faint)] line-through">${plan.precioLista}</span>
                      )}
                    </p>
                  </button>
                );
              })
            : planesInternet.map((plan) => {
                const active = planId === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    className={
                      "w-full rounded-xl border p-3.5 text-left transition-colors " +
                      (active ? "border-[var(--ce-primary)] bg-[var(--ce-primary-soft)]" : "border-[var(--ce-border)] bg-[var(--ce-surface)]")
                    }
                    onClick={() => props.onPlanChange(plan.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-[var(--ce-text)]">{plan.nombre}</p>
                        <p className="text-xs text-[var(--ce-text-muted)]">
                          {plan.velocidadMbps}MB · {plan.tipoConexion}
                          {plan.canales ? ` · ${plan.canales} canales` : ""}
                        </p>
                      </div>
                      {active && (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--ce-primary)] text-white">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-lg font-extrabold text-[var(--ce-primary-hover)]">
                      ${plan.precioPromocion}
                      <span className="text-xs font-medium text-[var(--ce-text-faint)]"> /mes</span>
                      {plan.precioPromocion !== plan.precioLista && (
                        <span className="ml-2 text-xs font-medium text-[var(--ce-text-faint)] line-through">${plan.precioLista}</span>
                      )}
                    </p>
                  </button>
                );
              })}
        </div>
      </div>

      {addonOptions.length > 0 && (
        <div className="ce-card space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--ce-warning-soft)] text-[var(--ce-warning)]">
              <Sparkles className="h-4 w-4" />
            </span>
            <p className="ce-eyebrow">Promociones y descuentos</p>
          </div>
          {addonOptions.map((addon) => {
            const checked = addonsSeleccionados.includes(addon);
            return (
              <label
                key={addon}
                className={
                  "flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 text-sm transition-colors " +
                  (checked ? "border-[var(--ce-primary)] bg-[var(--ce-primary-soft)]" : "border-transparent bg-black/15")
                }
              >
                <input type="checkbox" checked={checked} onChange={() => toggleAddon(addon)} className="mt-0.5 h-4 w-4 accent-[var(--ce-primary)]" />
                <span className="text-[var(--ce-text)]">{addon}</span>
              </label>
            );
          })}
        </div>
      )}

      {linea !== "tv" && (
        <div className="ce-card space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--ce-success-soft)] text-[var(--ce-success)]">
              <Smartphone className="h-4 w-4" />
            </span>
            <p className="ce-eyebrow">izzi móvil (opcional)</p>
          </div>
          {PLANES_IZZI_MOVIL.map((movil) => {
            const label = `izzi móvil ${movil.nombre}: ${movil.precioConServicioFijo}/mes con servicio fijo${movil.promoEspecial ? ` (${movil.promoEspecial})` : ""}`;
            const checked = addonsSeleccionados.includes(label);
            return (
              <label
                key={movil.id}
                className={
                  "flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 text-sm transition-colors " +
                  (checked ? "border-[var(--ce-primary)] bg-[var(--ce-primary-soft)]" : "border-transparent bg-black/15")
                }
              >
                <input type="checkbox" checked={checked} onChange={() => toggleAddon(label)} className="mt-0.5 h-4 w-4 accent-[var(--ce-primary)]" />
                <span className="text-[var(--ce-text)]">{label}</span>
              </label>
            );
          })}
        </div>
      )}

      {linea === "tv" && planId && (
        <p className="px-1 text-xs text-[var(--ce-text-faint)]">Cargo por instalación con técnico: ${CARGO_INSTALACION_TV} (pago único)</p>
      )}
    </div>
  );
}
