import { ActivatedRouteSnapshot } from '@angular/router';
import { MapComponent } from './map.component';
import { MapReuseStrategy } from './map-reuse.strategy';

function snap(component: unknown, routeConfig: object): ActivatedRouteSnapshot {
  return { component, routeConfig } as ActivatedRouteSnapshot;
}

describe('MapReuseStrategy', () => {
  const strategy = new MapReuseStrategy();

  it('reuses the map when the url changes from the root to a shop', () => {
    const root = snap(MapComponent, { path: '' });
    const shop = snap(MapComponent, { path: ':item' });

    expect(strategy.shouldReuseRoute(shop, root)).toBeTrue();
  });

  it('does not reuse the map for another page', () => {
    const map = snap(MapComponent, { path: '' });
    const other = snap(class Other {}, { path: 'legende' });

    expect(strategy.shouldReuseRoute(other, map)).toBeFalse();
  });
});
