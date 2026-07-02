export type ParsedCoords = { lat: number; lng: number } | null;

const SHORT_LINK_HOSTS = ["maps.app.goo.gl", "goo.gl"];

// Coordenadas sueltas: "19.4326, -99.1332"
const RAW_COORDS_REGEX = /^\s*(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)\s*$/;

function isValidLatLng(lat: number, lng: number) {
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

export function isShortMapsLink(value: string) {
  try {
    const url = new URL(value.trim());
    return SHORT_LINK_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

// Intenta extraer lat/lng de un texto que puede ser: coordenadas sueltas,
// o un link de Google Maps en alguno de sus formatos comunes:
//   .../@19.4326,-99.1332,17z
//   ...?q=19.4326,-99.1332
//   ...!3d19.4326!4d-99.1332
export function parseCoordsFromText(value: string): ParsedCoords {
  const text = String(value || "").trim();
  if (!text) return null;

  const rawMatch = text.match(RAW_COORDS_REGEX);
  if (rawMatch) {
    const lat = Number(rawMatch[1]);
    const lng = Number(rawMatch[2]);
    return isValidLatLng(lat, lng) ? { lat, lng } : null;
  }

  const atMatch = text.match(/@(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/);
  if (atMatch) {
    const lat = Number(atMatch[1]);
    const lng = Number(atMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  const qMatch = text.match(/[?&]q=(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/);
  if (qMatch) {
    const lat = Number(qMatch[1]);
    const lng = Number(qMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  const dMatch = text.match(/!3d(-?\d{1,2}\.\d+)!4d(-?\d{1,3}\.\d+)/);
  if (dMatch) {
    const lat = Number(dMatch[1]);
    const lng = Number(dMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  return null;
}

export function formatCoords(lat: number, lng: number) {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}
