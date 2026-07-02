import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CARGO_INSTALACION_TV,
  IzziLinea,
  NEGOCIOS_EXTRAS,
  PLANES_IZZI_MOVIL,
  PLANES_TV,
  PlanInternet,
  PlanMovil,
  PlanTv,
  RESIDENCIAL_EXTRAS,
  WIZZ_EXTRAS,
  planesPorLinea,
} from "../data/izziCatalog";
import {
  CatalogOverrides,
  GrupoExtrasOverride,
  MovilOverride,
  PlanOverride,
  WizzExtrasOverride,
  emptyCatalogOverrides,
  loadCatalogOverrides,
  saveCatalogOverrides,
} from "../storage/catalogOverrides";

function applyPlanOverride<T extends PlanInternet | PlanTv>(plan: T, overrides: Record<string, PlanOverride>): T {
  const o = overrides[plan.id];
  return o ? ({ ...plan, ...o } as T) : plan;
}

function applyMovilOverride(plan: PlanMovil, overrides: Record<string, MovilOverride>): PlanMovil {
  const o = overrides[plan.id];
  return o ? { ...plan, ...o } : plan;
}

function effectiveWizzExtras(o: WizzExtrasOverride) {
  return {
    pagoAnticipado: o.pagoAnticipado ?? WIZZ_EXTRAS.pagoAnticipado,
    descuentoDomiciliar: o.descuentoDomiciliar ?? WIZZ_EXTRAS.descuentoDomiciliar,
    descuentoPortabilidadTelefonica: o.descuentoPortabilidadTelefonica ?? WIZZ_EXTRAS.descuentoPortabilidadTelefonica,
    extensionTv: {
      gratisPrimerosMeses: o.extensionTvGratisPrimerosMeses ?? WIZZ_EXTRAS.extensionTv.gratisPrimerosMeses,
      precioApartirCuartoMes: o.extensionTvPrecioApartirCuartoMes ?? WIZZ_EXTRAS.extensionTv.precioApartirCuartoMes,
      segundaTerceraExtension: o.extensionTvSegundaTercera ?? WIZZ_EXTRAS.extensionTv.segundaTerceraExtension,
      nota: WIZZ_EXTRAS.extensionTv.nota,
    },
    streamingPromo: o.streamingPromo ?? WIZZ_EXTRAS.streamingPromo,
  };
}

function effectiveGrupoExtras(base: typeof NEGOCIOS_EXTRAS, o: GrupoExtrasOverride) {
  return {
    pagoAnticipado: {
      monto: o.pagoAnticipadoMonto ?? base.pagoAnticipado.monto,
      condiciones: o.pagoAnticipadoCondiciones ?? base.pagoAnticipado.condiciones,
    },
    descuentoAutomatizarPago: o.descuentoAutomatizarPago ?? base.descuentoAutomatizarPago,
    descuentoPortabilidadTelefonica: o.descuentoPortabilidadTelefonica ?? base.descuentoPortabilidadTelefonica,
    extensionTv: {
      precioMensual: o.extensionTvPrecioMensual ?? base.extensionTv.precioMensual,
      maximoPorPaquete: o.extensionTvMaximoPorPaquete ?? base.extensionTv.maximoPorPaquete,
    },
    descuentoPortabilidadInternetPorGrupo: base.descuentoPortabilidadInternetPorGrupo.map((grupo, index) => ({
      ...grupo,
      descuento: o.portabilidadGrupoDescuentos?.[index] ?? grupo.descuento,
    })),
  };
}

export function useCatalog() {
  const [overrides, setOverrides] = useState<CatalogOverrides>(emptyCatalogOverrides());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadCatalogOverrides().then((stored) => {
      setOverrides(stored);
      setLoaded(true);
    });
  }, []);

  const persist = useCallback((next: CatalogOverrides) => {
    setOverrides(next);
    saveCatalogOverrides(next);
  }, []);

  const updatePlan = useCallback(
    (id: string, patch: PlanOverride) => {
      persist({ ...overrides, planes: { ...overrides.planes, [id]: { ...overrides.planes[id], ...patch } } });
    },
    [overrides, persist]
  );

  const updateMovil = useCallback(
    (id: string, patch: MovilOverride) => {
      persist({ ...overrides, movil: { ...overrides.movil, [id]: { ...overrides.movil[id], ...patch } } });
    },
    [overrides, persist]
  );

  const updateWizzExtras = useCallback(
    (patch: WizzExtrasOverride) => persist({ ...overrides, wizz: { ...overrides.wizz, ...patch } }),
    [overrides, persist]
  );

  const updateNegociosExtras = useCallback(
    (patch: GrupoExtrasOverride) => persist({ ...overrides, negocios: { ...overrides.negocios, ...patch } }),
    [overrides, persist]
  );

  const updateResidencialExtras = useCallback(
    (patch: GrupoExtrasOverride) => persist({ ...overrides, residencial: { ...overrides.residencial, ...patch } }),
    [overrides, persist]
  );

  const updateCargoInstalacionTv = useCallback(
    (value: number) => persist({ ...overrides, cargoInstalacionTv: value }),
    [overrides, persist]
  );

  const resetPlan = useCallback(
    (id: string) => {
      const { [id]: _removed, ...rest } = overrides.planes;
      persist({ ...overrides, planes: rest });
    },
    [overrides, persist]
  );

  const resetMovil = useCallback(
    (id: string) => {
      const { [id]: _removed, ...rest } = overrides.movil;
      persist({ ...overrides, movil: rest });
    },
    [overrides, persist]
  );

  const resetAll = useCallback(() => persist(emptyCatalogOverrides()), [persist]);

  const hasAnyOverride = useMemo(
    () =>
      Object.keys(overrides.planes).length > 0 ||
      Object.keys(overrides.movil).length > 0 ||
      Object.keys(overrides.wizz).length > 0 ||
      Object.keys(overrides.negocios).length > 0 ||
      Object.keys(overrides.residencial).length > 0 ||
      overrides.cargoInstalacionTv !== undefined,
    [overrides]
  );

  const planesTv = useMemo(() => PLANES_TV.map((plan) => applyPlanOverride(plan, overrides.planes)), [overrides.planes]);
  const planesMovil = useMemo(() => PLANES_IZZI_MOVIL.map((plan) => applyMovilOverride(plan, overrides.movil)), [overrides.movil]);
  const cargoInstalacionTv = overrides.cargoInstalacionTv ?? CARGO_INSTALACION_TV;
  const wizzExtras = useMemo(() => effectiveWizzExtras(overrides.wizz), [overrides.wizz]);
  const negociosExtras = useMemo(() => effectiveGrupoExtras(NEGOCIOS_EXTRAS, overrides.negocios), [overrides.negocios]);
  const residencialExtras = useMemo(() => effectiveGrupoExtras(RESIDENCIAL_EXTRAS, overrides.residencial), [overrides.residencial]);

  const getPlanesPorLinea = useCallback(
    (linea: IzziLinea) => planesPorLinea(linea).map((plan) => applyPlanOverride(plan, overrides.planes)),
    [overrides.planes]
  );

  return {
    loaded,
    overrides,
    hasAnyOverride,
    planesTv,
    planesMovil,
    cargoInstalacionTv,
    wizzExtras,
    negociosExtras,
    residencialExtras,
    getPlanesPorLinea,
    updatePlan,
    updateMovil,
    updateWizzExtras,
    updateNegociosExtras,
    updateResidencialExtras,
    updateCargoInstalacionTv,
    resetPlan,
    resetMovil,
    resetAll,
  };
}

export type UseCatalogResult = ReturnType<typeof useCatalog>;
