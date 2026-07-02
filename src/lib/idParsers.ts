import { CURP_REGEX, normalizeCurpValue } from "./curp";
import { extractMrzFromOcrText } from "./mrz";
import { RFC_PERSONA_FISICA_REGEX, normalizeRfcValue } from "./rfc";

export type DocumentType =
  | "ine_frontal"
  | "ine_reverso"
  | "licencia_conducir"
  | "cedula_profesional"
  | "pasaporte"
  | "cartilla_militar"
  | "comprobante_domicilio";

export type ParsedIdFields = {
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  curp?: string;
  rfc?: string;
  fechaNacimiento?: string;
  calle?: string;
  colonia?: string;
  codigoPostal?: string;
  confidence: "alta" | "media" | "baja";
  rawText: string;
};

function findCurp(text: string): string {
  const normalized = text.toUpperCase().replace(/\s+/g, "");
  const match = normalized.match(CURP_REGEX);
  if (match) return match[0];
  // Tolerar OCR con espacios entre bloques de la CURP
  const loose = text.toUpperCase().match(/[A-Z]{4}\s*\d{6}\s*[HM]\s*[A-Z]{5}[A-Z0-9]\d/);
  return loose ? normalizeCurpValue(loose[0]) : "";
}

function findRfc(text: string): string {
  const lines = text.toUpperCase().split(/\s+/);
  for (const token of lines) {
    const normalized = normalizeRfcValue(token);
    if (RFC_PERSONA_FISICA_REGEX.test(normalized)) return normalized;
  }
  return "";
}

function findAfterLabel(text: string, labels: string[]): string {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (let i = 0; i < lines.length; i++) {
    const upper = lines[i].toUpperCase();
    if (labels.some((label) => upper.includes(label))) {
      const afterLabel = lines[i].replace(new RegExp(labels.join("|"), "i"), "").trim();
      if (afterLabel.length > 2) return afterLabel;
      if (lines[i + 1]) return lines[i + 1].trim();
    }
  }
  return "";
}

function findPostalCode(text: string): string {
  const match = text.match(/\bC\.?P\.?\s*:?\s*(\d{5})\b/i) || text.match(/\b(\d{5})\b/);
  return match ? match[1] : "";
}

function findFechaNacimiento(text: string): string {
  const iso = text.match(/\b(\d{4})[-/](\d{2})[-/](\d{2})\b/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const mx = text.match(/\b(\d{2})[-/](\d{2})[-/](\d{4})\b/);
  if (mx) return `${mx[3]}-${mx[2]}-${mx[1]}`;
  return "";
}

function guessNameFromIne(text: string) {
  const nombreLine = findAfterLabel(text, ["NOMBRE"]);
  return nombreLine;
}

export function parseIneText(rawText: string): ParsedIdFields {
  const curp = findCurp(rawText);
  const nombreLine = guessNameFromIne(rawText);
  const fechaNacimiento = findFechaNacimiento(rawText);
  const domicilioLine = findAfterLabel(rawText, ["DOMICILIO"]);
  return {
    curp,
    fechaNacimiento,
    calle: domicilioLine || undefined,
    nombres: nombreLine || undefined,
    confidence: curp ? "alta" : nombreLine ? "media" : "baja",
    rawText,
  };
}

export function parsePasaporteText(rawText: string): ParsedIdFields {
  const mrz = extractMrzFromOcrText(rawText);
  if (mrz?.ok) {
    return {
      nombres: mrz.nombres,
      apellidoPaterno: mrz.apellidos.split(" ")[0] || undefined,
      apellidoMaterno: mrz.apellidos.split(" ").slice(1).join(" ") || undefined,
      fechaNacimiento: mrz.fechaNacimiento || undefined,
      confidence: "alta",
      rawText,
    };
  }
  // Sin MRZ legible: intentar con etiquetas del cuerpo del pasaporte.
  const nombres = findAfterLabel(rawText, ["NOMBRES", "GIVEN NAMES"]);
  const apellidos = findAfterLabel(rawText, ["APELLIDOS", "SURNAME"]);
  return {
    nombres: nombres || undefined,
    apellidoPaterno: apellidos.split(" ")[0] || undefined,
    apellidoMaterno: apellidos.split(" ").slice(1).join(" ") || undefined,
    fechaNacimiento: findFechaNacimiento(rawText) || undefined,
    confidence: nombres || apellidos ? "media" : "baja",
    rawText,
  };
}

export function parseLicenciaConducirText(rawText: string): ParsedIdFields {
  const nombres = findAfterLabel(rawText, ["NOMBRE"]);
  const curp = findCurp(rawText);
  const fechaNacimiento = findFechaNacimiento(rawText);
  return {
    nombres: nombres || undefined,
    curp: curp || undefined,
    fechaNacimiento: fechaNacimiento || undefined,
    confidence: curp || nombres ? "media" : "baja",
    rawText,
  };
}

export function parseCedulaProfesionalText(rawText: string): ParsedIdFields {
  const nombres = findAfterLabel(rawText, ["NOMBRE", "C. PROFESIONAL", "TITULO DE"]);
  const curp = findCurp(rawText);
  const rfc = findRfc(rawText);
  return {
    nombres: nombres || undefined,
    curp: curp || undefined,
    rfc: rfc || undefined,
    confidence: curp || rfc || nombres ? "media" : "baja",
    rawText,
  };
}

export function parseCartillaMilitarText(rawText: string): ParsedIdFields {
  const nombres = findAfterLabel(rawText, ["NOMBRE", "MATRICULA"]);
  const curp = findCurp(rawText);
  const fechaNacimiento = findFechaNacimiento(rawText);
  return {
    nombres: nombres || undefined,
    curp: curp || undefined,
    fechaNacimiento: fechaNacimiento || undefined,
    confidence: curp || nombres ? "media" : "baja",
    rawText,
  };
}

export function parseComprobanteDomicilioText(rawText: string): ParsedIdFields {
  const codigoPostal = findPostalCode(rawText);
  const calle = findAfterLabel(rawText, ["CALLE", "DOMICILIO", "DIRECCION"]);
  const colonia = findAfterLabel(rawText, ["COLONIA", "COL."]);
  return {
    calle: calle || undefined,
    colonia: colonia || undefined,
    codigoPostal: codigoPostal || undefined,
    confidence: codigoPostal ? "media" : "baja",
    rawText,
  };
}

export function parseByDocumentType(type: DocumentType, rawText: string): ParsedIdFields {
  switch (type) {
    case "ine_frontal":
    case "ine_reverso":
      return parseIneText(rawText);
    case "pasaporte":
      return parsePasaporteText(rawText);
    case "licencia_conducir":
      return parseLicenciaConducirText(rawText);
    case "cedula_profesional":
      return parseCedulaProfesionalText(rawText);
    case "cartilla_militar":
      return parseCartillaMilitarText(rawText);
    case "comprobante_domicilio":
      return parseComprobanteDomicilioText(rawText);
    default:
      return { confidence: "baja", rawText };
  }
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  ine_frontal: "INE frontal",
  ine_reverso: "INE reverso",
  licencia_conducir: "Licencia de conducir",
  cedula_profesional: "Cédula profesional",
  pasaporte: "Pasaporte",
  cartilla_militar: "Cartilla militar",
  comprobante_domicilio: "Comprobante de domicilio",
};
