import { get, set } from "idb-keyval";

export type PlanOverride = Partial<{
  nombre: string;
  precioLista: number;
  precioPromocion: number;
  descuentoMensual: number;
  duracionDescuento: string;
  canales: number;
  megasAdicionalesX6Meses: number;
  mesesPromocion: number;
  ott: string[];
}>;

export type MovilOverride = Partial<{
  nombre: string;
  precioSinServicioIzzi: string;
  precioConServicioFijo: string;
  promoEspecial: string;
  descuentoPortabilidad: number;
}>;

export type WizzExtrasOverride = Partial<{
  pagoAnticipado: number;
  descuentoDomiciliar: number;
  descuentoPortabilidadTelefonica: number;
  extensionTvGratisPrimerosMeses: number;
  extensionTvPrecioApartirCuartoMes: number;
  extensionTvSegundaTercera: number;
  streamingPromo: string;
}>;

export type GrupoExtrasOverride = Partial<{
  pagoAnticipadoMonto: number;
  pagoAnticipadoCondiciones: string;
  descuentoAutomatizarPago: number;
  descuentoPortabilidadTelefonica: number;
  extensionTvPrecioMensual: number;
  extensionTvMaximoPorPaquete: number;
  portabilidadGrupoDescuentos: Record<number, number>;
}>;

export type CatalogOverrides = {
  planes: Record<string, PlanOverride>;
  movil: Record<string, MovilOverride>;
  cargoInstalacionTv?: number;
  wizz: WizzExtrasOverride;
  negocios: GrupoExtrasOverride;
  residencial: GrupoExtrasOverride;
};

export function emptyCatalogOverrides(): CatalogOverrides {
  return { planes: {}, movil: {}, wizz: {}, negocios: {}, residencial: {} };
}

const CATALOG_OVERRIDES_KEY = "captura_express_catalog_overrides_v1";

export async function loadCatalogOverrides(): Promise<CatalogOverrides> {
  const stored = await get(CATALOG_OVERRIDES_KEY).catch(() => null);
  if (!stored) return emptyCatalogOverrides();
  return { ...emptyCatalogOverrides(), ...stored };
}

export async function saveCatalogOverrides(overrides: CatalogOverrides) {
  await set(CATALOG_OVERRIDES_KEY, overrides);
}
