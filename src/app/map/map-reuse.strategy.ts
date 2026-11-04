import { ActivatedRouteSnapshot, BaseRouteReuseStrategy } from '@angular/router';
import { MapComponent } from './map.component';

/** `/` and `/:id` are two routes on one map. Rebuilding it reloads every pin. */
export class MapReuseStrategy extends BaseRouteReuseStrategy {
  override shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return super.shouldReuseRoute(future, curr)
      || (future.component === MapComponent && curr.component === MapComponent);
  }
}
