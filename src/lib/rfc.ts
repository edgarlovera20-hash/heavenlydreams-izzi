export const RFC_PERSONA_FISICA_REGEX = /^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/;

export function normalizeRfcValue(value: unknown) {
  return String(value || "")
    .replace(/[^A-Za-z0-9Ññ]/g, "")
    .toUpperCase()
    .slice(0, 13);
}

export function isValidRfcFormat(rfc: unknown) {
  return RFC_PERSONA_FISICA_REGEX.test(normalizeRfcValue(rfc));
}
