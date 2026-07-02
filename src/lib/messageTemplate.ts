import type { PlanInternet, PlanTv } from "../data/izziCatalog";
import type { ClientDraft } from "../storage/db";

export function stripAccentsUpper(value: string) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

export function fullNameUpper(draft: Pick<ClientDraft, "nombres" | "apellidoPaterno" | "apellidoMaterno">) {
  return stripAccentsUpper([draft.nombres, draft.apellidoPaterno, draft.apellidoMaterno].filter(Boolean).join(" "));
}

export function buildAddress(draft: ClientDraft) {
  return [
    draft.calle,
    draft.numeroExterior ? `No. Ext. ${draft.numeroExterior}` : "",
    draft.numeroInterior ? `No. Int. ${draft.numeroInterior}` : "",
    draft.colonia ? `Col. ${draft.colonia}` : "",
    draft.codigoPostal ? `C.P. ${draft.codigoPostal}` : "",
    draft.municipio,
  ]
    .filter(Boolean)
    .join(", ");
}

export function isDomicilioValidado(draft: ClientDraft) {
  return Boolean(draft.lat && draft.lng);
}

function formatMoney(value: number) {
  return value.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
}

function isPlanTv(plan: PlanInternet | PlanTv): plan is PlanTv {
  return !("velocidadMbps" in plan);
}

export function buildClientMessage(
  draft: ClientDraft,
  plan: PlanInternet | PlanTv,
  addons: string[],
  cargoInstalacion?: number
): string {
  const nombre = fullNameUpper(draft);
  const lines: string[] = [];

  lines.push(`Hola ${nombre || "estimado(a) cliente"}, este es el resumen de tu paquete izzi:`);
  lines.push("");
  lines.push(`Paquete: ${plan.nombre}`);

  if (isPlanTv(plan)) {
    lines.push(`Canales: ${plan.canales}`);
    if (plan.ott.length) lines.push(`Incluye: ${plan.ott.join(", ")}`);
    lines.push(`Precio de lista: ${formatMoney(plan.precioLista)} al mes`);
    if (plan.precioPromocion !== plan.precioLista) {
      const duracion = plan.mesesPromocion ? `los primeros ${plan.mesesPromocion} meses` : "";
      lines.push(`Precio promoción: ${formatMoney(plan.precioPromocion)} al mes ${duracion}`.trim());
    }
  } else {
    lines.push(`Velocidad: ${plan.velocidadMbps} Megas (${plan.tipoConexion})`);
    if (plan.canales) lines.push(`Canales: ${plan.canales}`);
    if (plan.ott.length) lines.push(`Incluye: ${plan.ott.join(", ")}`);
    lines.push(`Precio de lista: ${formatMoney(plan.precioLista)} al mes`);
    const duracion = plan.duracionDescuento === "permanente" ? "desde el primer mes" : plan.duracionDescuento;
    lines.push(`Precio promoción: ${formatMoney(plan.precioPromocion)} al mes (${duracion})`);
    if (plan.megasAdicionalesX6Meses) {
      lines.push(`Megas adicionales: +${plan.megasAdicionalesX6Meses}MB durante los primeros 6 meses`);
    }
  }

  if (cargoInstalacion) {
    lines.push(`Cargo por instalación: ${formatMoney(cargoInstalacion)} (pago único)`);
  }

  if (addons.length) {
    lines.push("");
    lines.push("Promociones y descuentos aplicables:");
    for (const addon of addons) lines.push(`- ${addon}`);
  }

  const direccion = buildAddress(draft);
  if (direccion) {
    lines.push("");
    lines.push(`Domicilio de instalación: ${direccion}`);
  }

  lines.push("");
  lines.push(isDomicilioValidado(draft) ? "Domicilio validado con coordenadas de ubicación." : "Nota interna: domicilio SIN VALIDAR (faltan coordenadas de ubicación).");

  return lines.join("\n");
}
