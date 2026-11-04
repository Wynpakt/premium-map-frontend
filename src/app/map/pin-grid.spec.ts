import { groupPins, MapPin, splitZoom, visibleGroups } from './pin-grid';

function pin(id: number, lat: number, lng: number): MapPin {
  return { id, lat, lng, types: [1], former: false };
}

function germanyPins(count: number): MapPin[] {
  const pins: MapPin[] = [];
  let seed = 1;
  for (let i = 0; i < count; i++) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const lat = 47.3 + (seed % 10000) / 10000 * 7.5;
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const lng = 6 + (seed % 10000) / 10000 * 9;
    pins.push(pin(i + 1, lat, lng));
  }
  return pins;
}

describe('pin grid', () => {
  const here = pin(1, 51.3, 9.5);
  const stacked = pin(2, 51.3, 9.5);
  const berlin = pin(3, 52.52, 13.405);
  const munich = pin(4, 48.137, 11.575);

  it('keeps a whole country as clusters and still counts every address', () => {
    const pins = germanyPins(5000);
    const groups = groupPins(pins, 7);
    const counted = groups.reduce((sum, group) => sum + group.pins.length, 0);

    expect(groups.length).toBeLessThan(400);
    expect(counted).toBe(5000);
  });

  it('keeps identical coordinates in one cell at street zoom', () => {
    expect(groupPins([here, stacked], 17).length).toBe(1);
    expect(splitZoom([here, stacked], 10, 17)).toBeNull();
  });

  it('separates Berlin and Munich at the country zoom', () => {
    expect(groupPins([berlin, munich], 7).length).toBe(2);
    expect(splitZoom([berlin, munich], 4, 17)).toBeGreaterThan(4);
  });

  it('drops groups outside the padded view', () => {
    const visible = visibleGroups([berlin, munich], 10, {
      south: 52.2,
      west: 13.0,
      north: 52.8,
      east: 13.8,
    });

    expect(visible.length).toBe(1);
    expect(visible[0].pins[0].id).toBe(berlin.id);
  });
});
