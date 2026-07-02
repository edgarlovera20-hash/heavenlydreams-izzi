// Parser de la zona legible por maquina (MRZ) de pasaportes, formato TD3 (ICAO 9303):
// dos lineas de 44 caracteres. Es el formato mas confiable de OCR porque es de ancho fijo.

export type MrzResult = {
  ok: boolean;
  apellidos: string;
  nombres: string;
  numeroPasaporte: string;
  nacionalidad: string;
  fechaNacimiento: string;
  sexo: "H" | "M" | "";
  fechaVigencia: string;
  raw: { line1: string; line2: string };
};

function yyMmDdToIso(yyMmDd: string) {
  if (!/^\d{6}$/.test(yyMmDd)) return "";
  const yy = Number(yyMmDd.slice(0, 2));
  const mm = yyMmDd.slice(2, 4);
  const dd = yyMmDd.slice(4, 6);
  const currentYY = new Date().getFullYear() % 100;
  const century = yy > currentYY + 10 ? 1900 : 2000;
  return `${century + yy}-${mm}-${dd}`;
}

function cleanMrzLine(line: string) {
  return line.toUpperCase().replace(/[^A-Z0-9<]/g, "");
}

// Busca en un texto OCR crudo dos lineas de 44 caracteres MRZ (con tolerancia a ruido).
export function findMrzLines(rawText: string): { line1: string; line2: string } | null {
  const candidates = rawText
    .split(/\r?\n/)
    .map((line) => cleanMrzLine(line))
    .filter((line) => line.length >= 40 && line.includes("<"));

  const line1 = candidates.find((line) => line.startsWith("P<") || line.startsWith("P "));
  if (!line1) return null;
  const idx = candidates.indexOf(line1);
  const line2 = candidates[idx + 1];
  if (!line2) return null;

  return {
    line1: line1.padEnd(44, "<").slice(0, 44),
    line2: line2.padEnd(44, "<").slice(0, 44),
  };
}

export function parseMrz(line1: string, line2: string): MrzResult {
  const raw = { line1, line2 };
  try {
    const nameField = line1.slice(5).replace(/<+$/g, "");
    const [apellidosRaw, nombresRaw = ""] = nameField.split("<<");
    const apellidos = apellidosRaw.replace(/</g, " ").trim();
    const nombres = nombresRaw.replace(/</g, " ").trim();

    const numeroPasaporte = line2.slice(0, 9).replace(/</g, "").trim();
    const nacionalidad = line2.slice(10, 13).replace(/</g, "").trim();
    const fechaNacimiento = yyMmDdToIso(line2.slice(13, 19));
    const sexoRaw = line2[20];
    const sexo: MrzResult["sexo"] = sexoRaw === "M" ? "H" : sexoRaw === "F" ? "M" : "";
    const fechaVigencia = yyMmDdToIso(line2.slice(21, 27));

    const ok = Boolean(apellidos && nombres && numeroPasaporte);
    return { ok, apellidos, nombres, numeroPasaporte, nacionalidad, fechaNacimiento, sexo, fechaVigencia, raw };
  } catch {
    return {
      ok: false,
      apellidos: "",
      nombres: "",
      numeroPasaporte: "",
      nacionalidad: "",
      fechaNacimiento: "",
      sexo: "",
      fechaVigencia: "",
      raw,
    };
  }
}

export function extractMrzFromOcrText(rawText: string): MrzResult | null {
  const lines = findMrzLines(rawText);
  if (!lines) return null;
  return parseMrz(lines.line1, lines.line2);
}
