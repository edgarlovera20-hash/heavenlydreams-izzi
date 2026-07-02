// Catálogo de paquetes izzi transcrito de los one-pagers de julio 2026
// (izzi tv+, wizz, Negocios, Residencial).
//
// IMPORTANTE: izzi actualiza precios y promociones mes a mes. Antes de
// cotizar a un cliente, verifica estos montos contra el one-pager vigente.

export type IzziLinea = "tv" | "wizz" | "negocios" | "residencial";
export type TipoConexion = "1P" | "2P" | "3P" | "2PM" | "3PM";

export type PlanInternet = {
  id: string;
  linea: IzziLinea;
  nombre: string;
  tipoConexion: TipoConexion;
  velocidadMbps: number;
  precioLista: number;
  precioPromocion: number;
  descuentoMensual: number;
  duracionDescuento: "permanente" | string; // ej. "x3 meses", "x6 meses"
  canales?: number;
  megasAdicionalesX6Meses?: number;
  ott: string[];
};

export type PlanTv = {
  id: string;
  nombre: string;
  precioLista: number;
  precioPromocion: number;
  mesesPromocion?: number;
  canales: number;
  ott: string[];
};

export type PlanMovil = {
  id: string;
  nombre: string;
  precioSinServicioIzzi: string;
  precioConServicioFijo: string;
  promoEspecial?: string;
  descuentoPortabilidad: number;
};

// ---------- izzi tv+ ----------

export const PLANES_TV: PlanTv[] = [
  {
    id: "tv_light",
    nombre: "izzi tv+ Light",
    precioLista: 199,
    precioPromocion: 199,
    canales: 84,
    ott: [],
  },
  {
    id: "tv_estandar",
    nombre: "izzi tv+",
    precioLista: 299,
    precioPromocion: 249,
    mesesPromocion: 3,
    canales: 200,
    ott: ["ViX Premium", "Sky Sports"],
  },
  {
    id: "tv_premium",
    nombre: "izzi tv+ Premium",
    precioLista: 499,
    precioPromocion: 399,
    mesesPromocion: 3,
    canales: 200,
    ott: ["ViX Premium", "Sky Sports", "Paramount+", "HBO Max (básico con anuncios)", "Apple TV"],
  },
];

export const CARGO_INSTALACION_TV = 500;

// ---------- wizz ----------

export const PLANES_WIZZ: PlanInternet[] = [
  // Plazas que ofrecen 10MB y 20MB
  { id: "wizz_2p_10", linea: "wizz", nombre: "wizz 2P 10 Megas", tipoConexion: "2P", velocidadMbps: 10, precioLista: 415, precioPromocion: 250, descuentoMensual: 165, duracionDescuento: "permanente", canales: 90, ott: ["ViX Premium"] },
  { id: "wizz_2p_20", linea: "wizz", nombre: "wizz 2P 20 Megas", tipoConexion: "2P", velocidadMbps: 20, precioLista: 445, precioPromocion: 319, descuentoMensual: 126, duracionDescuento: "permanente", canales: 90, ott: ["ViX Premium"] },
  { id: "wizz_3p_10", linea: "wizz", nombre: "wizz 3P 10 Megas", tipoConexion: "3P", velocidadMbps: 10, precioLista: 650, precioPromocion: 390, descuentoMensual: 260, duracionDescuento: "permanente", canales: 90, ott: ["ViX Premium", "HBO Max"] },
  { id: "wizz_3p_20", linea: "wizz", nombre: "wizz 3P 20 Megas", tipoConexion: "3P", velocidadMbps: 20, precioLista: 680, precioPromocion: 410, descuentoMensual: 270, duracionDescuento: "permanente", canales: 90, ott: ["ViX Premium"] },
  // 33 plazas que incrementaron velocidades
  { id: "wizz_2p_40", linea: "wizz", nombre: "wizz 2P 40 Megas", tipoConexion: "2P", velocidadMbps: 40, precioLista: 349, precioPromocion: 299, descuentoMensual: 50, duracionDescuento: "permanente", ott: [] },
  { id: "wizz_2p_60", linea: "wizz", nombre: "wizz 2P 60 Megas", tipoConexion: "2P", velocidadMbps: 60, precioLista: 470, precioPromocion: 339, descuentoMensual: 131, duracionDescuento: "permanente", ott: ["ViX Premium"] },
  { id: "wizz_2p_80", linea: "wizz", nombre: "wizz 2P 80 Megas", tipoConexion: "2P", velocidadMbps: 80, precioLista: 500, precioPromocion: 389, descuentoMensual: 111, duracionDescuento: "permanente", ott: ["ViX Premium"] },
  { id: "wizz_3p_40", linea: "wizz", nombre: "wizz 3P 40 Megas", tipoConexion: "3P", velocidadMbps: 40, precioLista: 499, precioPromocion: 449, descuentoMensual: 50, duracionDescuento: "permanente", canales: 200, ott: ["ViX Premium"] },
  { id: "wizz_3p_60", linea: "wizz", nombre: "wizz 3P 60 Megas", tipoConexion: "3P", velocidadMbps: 60, precioLista: 650, precioPromocion: 519, descuentoMensual: 131, duracionDescuento: "permanente", canales: 200, ott: ["ViX Premium"] },
  { id: "wizz_3p_80", linea: "wizz", nombre: "wizz 3P 80 Megas", tipoConexion: "3P", velocidadMbps: 80, precioLista: 680, precioPromocion: 569, descuentoMensual: 111, duracionDescuento: "permanente", canales: 200, ott: ["ViX Premium"] },
];

export const WIZZ_EXTRAS = {
  pagoAnticipado: 100,
  descuentoDomiciliar: 50,
  descuentoPortabilidadTelefonica: 15,
  extensionTv: { gratisPrimerosMeses: 3, precioApartirCuartoMes: 29, segundaTerceraExtension: 79, nota: "Solo zonas ON NET" },
  streamingPromo: "ViX Premium sin costo x6 meses (2P velocidades 60MB y 80MB; 3P a partir de 40MB en adelante). Sky Sports exclusivo en 3P a partir de 40MB.",
};

// ---------- izzi Negocios ----------

export const PLANES_NEGOCIOS: PlanInternet[] = [
  { id: "neg_2p_80", linea: "negocios", nombre: "izzi 80 Negocios", tipoConexion: "2P", velocidadMbps: 80, precioLista: 439, precioPromocion: 399, descuentoMensual: 40, duracionDescuento: "x3 meses", megasAdicionalesX6Meses: 100, ott: ["skeelo"] },
  { id: "neg_2p_100", linea: "negocios", nombre: "izzi 100 Negocios", tipoConexion: "2P", velocidadMbps: 100, precioLista: 530, precioPromocion: 479, descuentoMensual: 51, duracionDescuento: "x6 meses", megasAdicionalesX6Meses: 120, ott: ["ViX Premium", "skeelo"] },
  { id: "neg_2p_120", linea: "negocios", nombre: "izzi 120 Negocios", tipoConexion: "2P", velocidadMbps: 120, precioLista: 590, precioPromocion: 509, descuentoMensual: 81, duracionDescuento: "permanente", megasAdicionalesX6Meses: 150, ott: ["ViX Premium", "HBO Max", "skeelo"] },
  { id: "neg_2p_150", linea: "negocios", nombre: "izzi 150 Negocios", tipoConexion: "2P", velocidadMbps: 150, precioLista: 690, precioPromocion: 589, descuentoMensual: 101, duracionDescuento: "permanente", megasAdicionalesX6Meses: 200, ott: ["ViX Premium", "HBO Max", "Disney+/Apple TV", "skeelo"] },
  { id: "neg_2p_200", linea: "negocios", nombre: "izzi 200 Negocios", tipoConexion: "2P", velocidadMbps: 200, precioLista: 750, precioPromocion: 649, descuentoMensual: 101, duracionDescuento: "permanente", megasAdicionalesX6Meses: 300, ott: ["ViX Premium", "HBO Max", "Disney+/Apple TV", "skeelo"] },
  { id: "neg_2p_500", linea: "negocios", nombre: "izzi 500 Negocios", tipoConexion: "2P", velocidadMbps: 500, precioLista: 870, precioPromocion: 769, descuentoMensual: 101, duracionDescuento: "permanente", megasAdicionalesX6Meses: 600, ott: ["ViX Premium", "HBO Max", "Disney+/Apple TV", "skeelo"] },
  { id: "neg_2p_1000", linea: "negocios", nombre: "izzi 1000 Negocios", tipoConexion: "2P", velocidadMbps: 1000, precioLista: 1070, precioPromocion: 969, descuentoMensual: 101, duracionDescuento: "permanente", ott: ["ViX Premium", "HBO Max", "Disney+/Apple TV", "skeelo"] },

  { id: "neg_3p_80", linea: "negocios", nombre: "izzi 80 Negocios 3P", tipoConexion: "3P", velocidadMbps: 80, precioLista: 589, precioPromocion: 549, descuentoMensual: 40, duracionDescuento: "x6 meses", canales: 100, megasAdicionalesX6Meses: 100, ott: ["skeelo", "izzi go (Bundesliga, LaLiga, Sky Sports)"] },
  { id: "neg_3p_100", linea: "negocios", nombre: "izzi 100 Negocios 3P", tipoConexion: "3P", velocidadMbps: 100, precioLista: 680, precioPromocion: 629, descuentoMensual: 51, duracionDescuento: "x6 meses", canales: 100, megasAdicionalesX6Meses: 120, ott: ["ViX Premium", "skeelo", "izzi go (Bundesliga, LaLiga, Sky Sports)"] },
  { id: "neg_3p_120", linea: "negocios", nombre: "izzi 120 Negocios 3P", tipoConexion: "3P", velocidadMbps: 120, precioLista: 770, precioPromocion: 689, descuentoMensual: 81, duracionDescuento: "permanente", canales: 200, megasAdicionalesX6Meses: 150, ott: ["ViX Premium", "HBO Max", "skeelo", "izzi go (Bundesliga, LaLiga, Sky Sports)"] },
  { id: "neg_3p_150", linea: "negocios", nombre: "izzi 150 Negocios 3P", tipoConexion: "3P", velocidadMbps: 150, precioLista: 870, precioPromocion: 769, descuentoMensual: 101, duracionDescuento: "permanente", canales: 200, megasAdicionalesX6Meses: 200, ott: ["ViX Premium", "HBO Max", "Disney+/Apple TV", "skeelo", "izzi go (Bundesliga, LaLiga, Sky Sports)"] },
  { id: "neg_3p_200", linea: "negocios", nombre: "izzi 200 Negocios 3P", tipoConexion: "3P", velocidadMbps: 200, precioLista: 930, precioPromocion: 829, descuentoMensual: 101, duracionDescuento: "permanente", canales: 200, megasAdicionalesX6Meses: 300, ott: ["ViX Premium", "HBO Max", "Disney+/Apple TV", "skeelo", "izzi go (Bundesliga, LaLiga, Sky Sports)"] },
  { id: "neg_3p_500", linea: "negocios", nombre: "izzi 500 Negocios 3P", tipoConexion: "3P", velocidadMbps: 500, precioLista: 1050, precioPromocion: 949, descuentoMensual: 101, duracionDescuento: "permanente", canales: 200, megasAdicionalesX6Meses: 600, ott: ["ViX Premium", "HBO Max", "Disney+/Apple TV", "skeelo", "izzi go (Bundesliga, LaLiga, Sky Sports)"] },
  { id: "neg_3p_1000", linea: "negocios", nombre: "izzi 1000 Negocios 3P", tipoConexion: "3P", velocidadMbps: 1000, precioLista: 1250, precioPromocion: 1149, descuentoMensual: 101, duracionDescuento: "permanente", canales: 200, ott: ["ViX Premium", "HBO Max", "Disney+/Apple TV", "skeelo", "izzi go (Bundesliga, LaLiga, Sky Sports)"] },
];

export const NEGOCIOS_EXTRAS = {
  pagoAnticipado: { monto: 400, condiciones: "Aplica para velocidades de 100 a 1000 MB en 3P y 3PM, a nivel nacional, excepto plazas con pago anticipado de $100 y referidos de Call Center." },
  descuentoAutomatizarPago: 50,
  descuentoPortabilidadTelefonica: 15,
  extensionTv: { precioMensual: 79, maximoPorPaquete: 3 },
  descuentoPortabilidadInternetPorGrupo: [
    { grupo: ["neg_2p_80", "neg_2p_100", "neg_3p_80", "neg_3p_100"], descuento: 21 },
    { grupo: ["neg_2p_120", "neg_3p_120"], descuento: 26 },
    { grupo: ["neg_2p_150", "neg_2p_200", "neg_3p_150", "neg_3p_200"], descuento: 53 },
    { grupo: ["neg_2p_500", "neg_2p_1000", "neg_3p_500", "neg_3p_1000"], descuento: 79 },
  ],
};

// ---------- izzi Residencial ----------

export const PLANES_RESIDENCIAL: PlanInternet[] = [
  { id: "res_2p_80", linea: "residencial", nombre: "izzi 80 Residencial", tipoConexion: "2P", velocidadMbps: 80, precioLista: 389, precioPromocion: 349, descuentoMensual: 40, duracionDescuento: "x3 meses", megasAdicionalesX6Meses: 100, ott: ["skeelo"] },
  { id: "res_2p_100", linea: "residencial", nombre: "izzi 100 Residencial", tipoConexion: "2P", velocidadMbps: 100, precioLista: 480, precioPromocion: 429, descuentoMensual: 51, duracionDescuento: "x6 meses", megasAdicionalesX6Meses: 120, ott: ["ViX Premium", "skeelo"] },
  { id: "res_2p_120", linea: "residencial", nombre: "izzi 120 Residencial", tipoConexion: "2P", velocidadMbps: 120, precioLista: 540, precioPromocion: 459, descuentoMensual: 81, duracionDescuento: "permanente", megasAdicionalesX6Meses: 150, ott: ["ViX Premium", "HBO Max", "skeelo"] },
  { id: "res_2p_150", linea: "residencial", nombre: "izzi 150 Residencial", tipoConexion: "2P", velocidadMbps: 150, precioLista: 640, precioPromocion: 539, descuentoMensual: 101, duracionDescuento: "permanente", megasAdicionalesX6Meses: 200, ott: ["ViX Premium", "HBO Max", "Disney+/Apple TV", "skeelo"] },
  { id: "res_2p_200", linea: "residencial", nombre: "izzi 200 Residencial", tipoConexion: "2P", velocidadMbps: 200, precioLista: 700, precioPromocion: 599, descuentoMensual: 101, duracionDescuento: "permanente", megasAdicionalesX6Meses: 300, ott: ["ViX Premium", "HBO Max", "Disney+/Apple TV", "skeelo"] },
  { id: "res_2p_500", linea: "residencial", nombre: "izzi 500 Residencial", tipoConexion: "2P", velocidadMbps: 500, precioLista: 820, precioPromocion: 719, descuentoMensual: 101, duracionDescuento: "permanente", megasAdicionalesX6Meses: 600, ott: ["ViX Premium", "HBO Max", "Disney+/Apple TV", "skeelo"] },
  { id: "res_2p_1000", linea: "residencial", nombre: "izzi 1000 Residencial", tipoConexion: "2P", velocidadMbps: 1000, precioLista: 1020, precioPromocion: 919, descuentoMensual: 101, duracionDescuento: "permanente", ott: ["ViX Premium", "HBO Max", "Disney+/Apple TV", "skeelo"] },

  { id: "res_3p_80", linea: "residencial", nombre: "izzi 80 Residencial 3P", tipoConexion: "3P", velocidadMbps: 80, precioLista: 539, precioPromocion: 499, descuentoMensual: 40, duracionDescuento: "x6 meses", canales: 100, megasAdicionalesX6Meses: 100, ott: ["skeelo", "izzi go (Bundesliga, LaLiga, Sky Sports)"] },
  { id: "res_3p_100", linea: "residencial", nombre: "izzi 100 Residencial 3P", tipoConexion: "3P", velocidadMbps: 100, precioLista: 630, precioPromocion: 579, descuentoMensual: 51, duracionDescuento: "x6 meses", canales: 100, megasAdicionalesX6Meses: 120, ott: ["ViX Premium", "skeelo", "izzi go (Bundesliga, LaLiga, Sky Sports)"] },
  { id: "res_3p_120", linea: "residencial", nombre: "izzi 120 Residencial 3P", tipoConexion: "3P", velocidadMbps: 120, precioLista: 720, precioPromocion: 639, descuentoMensual: 81, duracionDescuento: "permanente", canales: 200, megasAdicionalesX6Meses: 150, ott: ["ViX Premium", "HBO Max", "skeelo", "izzi go (Bundesliga, LaLiga, Sky Sports)"] },
  { id: "res_3p_150", linea: "residencial", nombre: "izzi 150 Residencial 3P", tipoConexion: "3P", velocidadMbps: 150, precioLista: 820, precioPromocion: 719, descuentoMensual: 101, duracionDescuento: "permanente", canales: 200, megasAdicionalesX6Meses: 200, ott: ["ViX Premium", "HBO Max", "Disney+/Apple TV", "skeelo", "izzi go (Bundesliga, LaLiga, Sky Sports)"] },
  { id: "res_3p_200", linea: "residencial", nombre: "izzi 200 Residencial 3P", tipoConexion: "3P", velocidadMbps: 200, precioLista: 880, precioPromocion: 779, descuentoMensual: 101, duracionDescuento: "permanente", canales: 200, megasAdicionalesX6Meses: 300, ott: ["ViX Premium", "HBO Max", "Disney+/Apple TV", "skeelo", "izzi go (Bundesliga, LaLiga, Sky Sports)"] },
  { id: "res_3p_500", linea: "residencial", nombre: "izzi 500 Residencial 3P", tipoConexion: "3P", velocidadMbps: 500, precioLista: 1000, precioPromocion: 899, descuentoMensual: 101, duracionDescuento: "permanente", canales: 200, megasAdicionalesX6Meses: 600, ott: ["ViX Premium", "HBO Max", "Disney+/Apple TV", "skeelo", "izzi go (Bundesliga, LaLiga, Sky Sports)"] },
  { id: "res_3p_1000", linea: "residencial", nombre: "izzi 1000 Residencial 3P", tipoConexion: "3P", velocidadMbps: 1000, precioLista: 1200, precioPromocion: 1099, descuentoMensual: 101, duracionDescuento: "permanente", canales: 200, ott: ["ViX Premium", "HBO Max", "Disney+/Apple TV", "skeelo", "izzi go (Bundesliga, LaLiga, Sky Sports)"] },
];

export const RESIDENCIAL_EXTRAS = {
  pagoAnticipado: { monto: 350, condiciones: "Aplica para velocidades de 100 a 1000 MB en 3P y 3PM, a nivel nacional, excepto plazas con pago anticipado de $100 y referidos de Call Center." },
  descuentoAutomatizarPago: 50,
  descuentoPortabilidadTelefonica: 15,
  extensionTv: { precioMensual: 79, maximoPorPaquete: 3 },
  descuentoPortabilidadInternetPorGrupo: [
    { grupo: ["res_2p_80", "res_2p_100", "res_3p_80", "res_3p_100"], descuento: 21 },
    { grupo: ["res_2p_120", "res_3p_120"], descuento: 26 },
    { grupo: ["res_2p_150", "res_2p_200", "res_3p_150", "res_3p_200"], descuento: 53 },
    { grupo: ["res_2p_500", "res_2p_1000", "res_3p_500", "res_3p_1000"], descuento: 79 },
  ],
};

// ---------- izzi móvil (comparte los mismos planes en wizz, Negocios y Residencial) ----------

export const PLANES_IZZI_MOVIL: PlanMovil[] = [
  { id: "movil_5gb", nombre: "5GB", precioSinServicioIzzi: "$240", precioConServicioFijo: "$120", promoEspecial: "$99 x12 meses", descuentoPortabilidad: 21 },
  { id: "movil_10gb", nombre: "10GB", precioSinServicioIzzi: "$300 / $360", precioConServicioFijo: "$150 / $180", descuentoPortabilidad: 26 },
  { id: "movil_20gb", nombre: "20GB", precioSinServicioIzzi: "$500", precioConServicioFijo: "$250", descuentoPortabilidad: 44 },
  { id: "movil_comparte", nombre: "Comparte tus datos", precioSinServicioIzzi: "$600 / $700", precioConServicioFijo: "$300 / $350", promoEspecial: "$270 x12 meses + Apple TV x12 meses", descuentoPortabilidad: 53 },
  { id: "movil_familiar", nombre: "Plan Familiar", precioSinServicioIzzi: "$900", precioConServicioFijo: "$450", promoEspecial: "$399 x12 meses", descuentoPortabilidad: 79 },
];

export function planesPorLinea(linea: IzziLinea): PlanInternet[] {
  if (linea === "wizz") return PLANES_WIZZ;
  if (linea === "negocios") return PLANES_NEGOCIOS;
  if (linea === "residencial") return PLANES_RESIDENCIAL;
  return [];
}
