/**
 * Groups addresses into screen-pixel cells.
 * The map then builds a Leaflet marker only for each visible cell,
 * not for every address.
 *
 * shortcut: cells do not merge across a grid line, so two nearby shops can
 * stay in separate bubbles until the next zoom. Switch to distance clustering
 * if that looks wrong on the map.
 */
const CLUSTER_RADIUS_PX = 60;
const TILE_PX = 256;

export interface MapPin {
  id: number;
  lat: number;
  lng: number;
  types: number[];
  former: boolean;
}

export interface PinGroup {
  pins: MapPin[];
  lat: number;
  lng: number;
}

export interface MapBounds {
  south: number;
  west: number;
  north: number;
  east: number;
}

function worldPx(zoom: number): number {
  return TILE_PX * 2 ** zoom;
}

function project(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const scale = worldPx(zoom);
  const clamped = Math.max(-85, Math.min(85, lat));
  const sin = Math.sin(clamped * Math.PI / 180);
  return {
    x: ((lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  };
}

export function groupPins(pins: MapPin[], zoom: number, radiusPx = CLUSTER_RADIUS_PX): PinGroup[] {
  const cells = new Map<string, MapPin[]>();
  for (const pin of pins) {
    const point = project(pin.lat, pin.lng, zoom);
    const key = `${Math.floor(point.x / radiusPx)}:${Math.floor(point.y / radiusPx)}`;
    const list = cells.get(key);
    if (list) {
      list.push(pin);
    } else {
      cells.set(key, [pin]);
    }
  }

  const groups: PinGroup[] = [];
  for (const list of cells.values()) {
    let lat = 0;
    let lng = 0;
    for (const pin of list) {
      lat += pin.lat;
      lng += pin.lng;
    }
    groups.push({ pins: list, lat: lat / list.length, lng: lng / list.length });
  }
  return groups;
}

export function visibleGroups(
  pins: MapPin[],
  zoom: number,
  bounds: MapBounds,
  radiusPx = CLUSTER_RADIUS_PX,
): PinGroup[] {
  const lngPad = (radiusPx / worldPx(zoom)) * 360;
  const midLat = (bounds.south + bounds.north) / 2;
  const latPad = lngPad / (Math.cos(midLat * Math.PI / 180) || 1);
  return groupPins(pins, zoom, radiusPx).filter(group =>
    group.lat >= bounds.south - latPad
    && group.lat <= bounds.north + latPad
    && group.lng >= bounds.west - lngPad
    && group.lng <= bounds.east + lngPad
  );
}

/** First zoom above `zoom` where these pins no longer share one cell. */
export function splitZoom(
  pins: MapPin[],
  zoom: number,
  maxZoom: number,
  radiusPx = CLUSTER_RADIUS_PX,
): number | null {
  for (let next = zoom + 1; next <= maxZoom; next++) {
    if (groupPins(pins, next, radiusPx).length > 1) {
      return next;
    }
  }
  return null;
}
