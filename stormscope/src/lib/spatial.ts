/**
 * Lightweight, zero-dependency 2D point-in-polygon spatial helpers
 * for client-side GeoJSON intersection against Odisha districts,
 * hazard corridors, and flood/surge zones.
 */

function pointInRing(lng: number, lat: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInPolygonCoords(
  lng: number,
  lat: number,
  rings: number[][][]
): boolean {
  if (!rings.length || !pointInRing(lng, lat, rings[0])) return false;
  for (let i = 1; i < rings.length; i++) {
    if (pointInRing(lng, lat, rings[i])) return false;
  }
  return true;
}

export function pointInGeometry(
  lng: number,
  lat: number,
  geometry: GeoJSON.Geometry | null | undefined
): boolean {
  if (!geometry) return false;
  if (geometry.type === "Polygon") {
    return pointInPolygonCoords(lng, lat, geometry.coordinates);
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.some((poly) =>
      pointInPolygonCoords(lng, lat, poly)
    );
  }
  return false;
}

/** Find the first GeoJSON feature containing [lng, lat] */
export function findContainingFeature(
  lng: number,
  lat: number,
  collection?: GeoJSON.FeatureCollection
): GeoJSON.Feature | undefined {
  if (!collection) return undefined;
  return collection.features.find((f) => pointInGeometry(lng, lat, f.geometry));
}

/** Find all GeoJSON features containing [lng, lat] */
export function findAllContainingFeatures(
  lng: number,
  lat: number,
  collection?: GeoJSON.FeatureCollection
): GeoJSON.Feature[] {
  if (!collection) return [];
  return collection.features.filter((f) => pointInGeometry(lng, lat, f.geometry));
}
