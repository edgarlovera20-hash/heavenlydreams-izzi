export const CURP_REGEX = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;

const CHECKSUM_CHARS = "0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";

export function normalizeCurpValue(value: unknown) {
  return String(value || "")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase()
    .slice(0, 18);
}

export function calculateCurpCheckDigit(curp17: string) {
  const normalized = curp17.toUpperCase().slice(0, 17);
  if (normalized.length !== 17) return "";
  let sum = 0;
  for (let i = 0; i < normalized.length; i++) {
    const value = CHECKSUM_CHARS.indexOf(normalized[i]);
    if (value < 0) return "";
    sum += value * (18 - i);
  }
  return String((10 - (sum % 10)) % 10);
}

export function validateCurpChecksum(curp: unknown) {
  const normalized = normalizeCurpValue(curp);
  return CURP_REGEX.test(normalized) && calculateCurpCheckDigit(normalized.slice(0, 17)) === normalized[17];
}

export function isValidCurpFormat(curp: unknown) {
  return CURP_REGEX.test(normalizeCurpValue(curp));
}
