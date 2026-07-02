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

const LINEAS: { id: IzziLinea; label: string }[] = [
  { id: "tv", label: "izzi tv+" },
  { id: "wizz", label: "wizz" },
  { id: "negocios", label: "Negocios" },
  { id: "residencial", label: "Residencial" },
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
      <div className="ce-card space-y-2">
        <p className="ce-label">Línea de negocio</p>
        <div className="grid grid-cols-2 gap-2">
          {LINEAS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`ce-btn ${linea === item.id ? "ce-btn-primary" : "ce-btn-secondary"}`}
              onClick={() => {
                props.onLineaChange(item.id);
                props.onPlanChange("");
                props.onAddonsChange([]);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ce-card space-y-2">
        <p className="ce-label">Paquete</p>
        <div className="space-y-2">
          {linea === "tv"
            ? PLANES_TV.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  className={`ce-btn w-full text-left ${planId === plan.id ? "ce-btn-primary" : "ce-btn-secondary"}`}
                  onClick={() => props.onPlanChange(plan.id)}
                >
                  {plan.nombre} — {plan.canales} canales — desde ${plan.precioPromocion}/mes
                </button>
              ))
            : planesInternet.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  className={`ce-btn w-full text-left ${planId === plan.id ? "ce-btn-primary" : "ce-btn-secondary"}`}
                  onClick={() => props.onPlanChange(plan.id)}
                >
                  {plan.nombre} — {plan.velocidadMbps}MB — desde ${plan.precioPromocion}/mes
                </button>
              ))}
        </div>
      </div>

      {addonOptions.length > 0 && (
        <div className="ce-card space-y-2">
          <p className="ce-label">Promociones y descuentos aplicables</p>
          {addonOptions.map((addon) => (
            <label key={addon} className="flex items-start gap-2 text-sm">
              <input type="checkbox" checked={addonsSeleccionados.includes(addon)} onChange={() => toggleAddon(addon)} className="mt-1" />
              <span>{addon}</span>
            </label>
          ))}
        </div>
      )}

      {linea !== "tv" && (
        <div className="ce-card space-y-2">
          <p className="ce-label">izzi móvil (opcional)</p>
          {PLANES_IZZI_MOVIL.map((movil) => {
            const label = `izzi móvil ${movil.nombre}: ${movil.precioConServicioFijo}/mes con servicio fijo${movil.promoEspecial ? ` (${movil.promoEspecial})` : ""}`;
            return (
              <label key={movil.id} className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={addonsSeleccionados.includes(label)} onChange={() => toggleAddon(label)} className="mt-1" />
                <span>{label}</span>
              </label>
            );
          })}
        </div>
      )}

      {linea === "tv" && planId && (
        <p className="text-xs text-slate-400">Cargo por instalación con técnico: ${CARGO_INSTALACION_TV} (pago único)</p>
      )}
    </div>
  );
}
