import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { Subject } from "rxjs";
import * as L from "leaflet";
import "leaflet.markercluster";
import { SelectItem } from "../dropdown/dropdown.component";
import { SearchResult, Item, SearchService } from "../search.service";
import { ActivatedRoute, Router, Params } from "@angular/router";
import { debounceTime } from "rxjs/operators";
import { createCornerActionsControl, createCustomLeafletControl } from './CustomLeafletControl';
import { distanceByLatLong } from './distanceByLatLong';
import { shopPopupHtml } from './shop-popup';
import { environment } from '../../environments/environment';

const STATE_OPTIONS: { id: string; name: string }[] = [
  { id: 'BW', name: 'Baden-Württemberg' },
  { id: 'BY', name: 'Bayern' },
  { id: 'BE', name: 'Berlin' },
  { id: 'BB', name: 'Brandenburg' },
  { id: 'HB', name: 'Bremen' },
  { id: 'HH', name: 'Hamburg' },
  { id: 'HE', name: 'Hessen' },
  { id: 'MV', name: 'Mecklenburg-Vorpommern' },
  { id: 'NI', name: 'Niedersachsen' },
  { id: 'NW', name: 'Nordrhein-Westfalen' },
  { id: 'RP', name: 'Rheinland-Pfalz' },
  { id: 'SL', name: 'Saarland' },
  { id: 'SN', name: 'Sachsen' },
  { id: 'ST', name: 'Sachsen-Anhalt' },
  { id: 'SH', name: 'Schleswig-Holstein' },
  { id: 'TH', name: 'Thüringen' },
];

@Component({
    selector: "app-map",
    templateUrl: "./map.component.html",
    styleUrls: ["./map.component.css"],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class MapComponent implements OnInit {
  private map: L.Map | undefined;
  private markerClusterGroup: L.MarkerClusterGroup | undefined;
  private defaultHomePosition: L.LatLng = L.latLng(
    50.93766174471314,
    9.777832031250002,
  );
  public homePosition: GeolocationCoordinates | undefined = undefined;

  private defaultZoomLevel = 7;
  private defaultZoomLevelToHome = 12;

  // State of the offertypes in the top bar
  public offertypes: { [id: string]: SelectItem } = {
    laeden: {
      id: "laeden",
      name: "Laden",
      value: true,
      icon: "marker-icon-l.b3124d196493d83e9aa500089c5ce67490a7cec1847fce891842f2d3cbf31f1f.svg",
    },
    haendler: {
      id: "haendler",
      name: "(Groß)Handel",
      value: true,
      icon: "marker-icon-h.e30564530d085950c9d25baf877b72bede18682696a01332803249a20f5f6a8d.svg",
    },
    sprecher: {
      id: "sprecher",
      name: "lokaler Kontakt",
      value: true,
      icon: "marker-icon-s.58b6019d3d0c125cc029d122ca9fa075cd77023d4bade1f67bc67e077525d486.svg",
    },
    webshop: {
      id: "webshop",
      name: "Onlinehandel",
      value: true,
      icon: "marker-icon-o.46085aa61342e805eb5bfb6fa9e2f6b96e95a45a01ab2e58d9f33a3aa74ef0ae.svg",
    },
  };

  public products: { [id: string]: SelectItem } = {
    cola: {
      id: "cola",
      name: "Cola",
      value: true,
    },
    bier: {
      id: "bier",
      name: "Bier (Bio)",
      value: true,
    },
    frohlunder: {
      id: "frohlunder",
      name: "Frohlunder (Bio)",
      value: true,
    },
    muntermate: {
      id: "muntermate",
      name: "Muntermate (Bio)",
      value: true,
    },
  };

  public countriesState: { [id: string]: boolean } = {
    DE: true,
    AT: true,
    CH: true,
  };

  public readonly internal = environment.internal;
  public statuses: { [id: string]: SelectItem } = {};
  public visibility: { [id: string]: SelectItem } = {};
  public states: { [id: string]: SelectItem } = {};
  public addressGroups: { [id: string]: SelectItem } = {};

  private itemList: any[];

  public debounceSearchInput: Subject<string> = new Subject();
  public searchResults: SearchResult[] = [];

  public selectedItem: Item | undefined;

  constructor(
    private route: ActivatedRoute,
    public searchService: SearchService,
    public router: Router,
  ) {
    this.itemList = [];
    if (!environment.internal) {
      return;
    }
    this.offertypes.ohne = { id: 'ohne', name: 'ohne Rolle', value: true };
    this.products.ohne = { id: 'ohne', name: 'ohne Produkt', value: true };
    this.countriesState.OTHER = true;
    this.statuses = {
      aktuell: { id: 'aktuell', name: 'aktuell', value: true },
      ehemalig: { id: 'ehemalig', name: 'ehemalig', value: true },
    };
    this.visibility = {
      oeffentlich: { id: 'oeffentlich', name: 'auf der öffentlichen Karte', value: true },
      verborgen: { id: 'verborgen', name: 'ausdrücklich nicht', value: true },
    };
    STATE_OPTIONS.forEach(state => {
      this.states[state.id] = { id: state.id, name: state.name, value: true };
    });
  }

  async ngOnInit() {
    this.initalizeMap();

    if (this.internal) {
      this.searchService.addressGroups().subscribe({
        next: (groups) => {
          this.applyAddressGroups(groups);
          this.startMarkerLoad();
        },
        error: () => this.startMarkerLoad(),
      });
    } else {
      this.startMarkerLoad();
    }

    this.route.queryParams
      .subscribe((queryParams: Params) => {
        if (queryParams['userPosition']) {
          this.map && this.centerMapOnUserPosition(this.map);
        } else {
          this.map && this.map.setView(this.defaultHomePosition, this.defaultZoomLevel);
        }
      })

    this.debounceSearchInput
      .pipe(debounceTime(200))
      .subscribe((searchKeyword: string) => {
        this.search(searchKeyword);
      });
  }

  private initalizeMap() {
    this.map = L.map("map", {
      maxZoom: 17,
      zoomControl: false,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);

    // Add zoom control to the bottom left
    L.control
      .zoom({
        position: "bottomleft",
      })
      .addTo(this.map);

    const cornerActions = createCornerActionsControl(
      () => {
        this.router.navigate(["/feedback/neu"]);
      },
      () => {
        this.toggleImprint();
      },
    );
    this.map.addControl(new cornerActions());

    // Add home control button
    const homeControl = createCustomLeafletControl("bottomleft", "home", () => {
      if (this.router.isActive("/", true /* exact */)) {
        this.map && this.map.setView(this.defaultHomePosition, this.defaultZoomLevel);
      } else {
        this.router.navigateByUrl("/");
      }
    });
    this.map.addControl(new homeControl());

    // Add locate control button
    const locateControl = createCustomLeafletControl("bottomleft", "crosshairs", () => {
      this.router.navigate(["/"], { queryParams: { userPosition: 'true' } })
    });
    this.map.addControl(new locateControl());

    // Hide search results on map clicked event
    this.map.addEventListener("click", () => {
      this.searchResults = [];
    });
  }

  private centerMapOnUserPosition(map: L.Map): void {
    if (!('geolocation' in navigator)) {
      return;
    }
    navigator.geolocation.getCurrentPosition((position) => {
      this.homePosition = position.coords;
      const latlng = new L.LatLng(position.coords.latitude, position.coords.longitude);
      map.setView(latlng, this.defaultZoomLevelToHome);
    }, () => {
      this.router.navigateByUrl("/");
    }, {
      maximumAge: 30 * 60 * 1000
    })
  }

  /**
   * This firstly adds a MarkerClusterGroup where the actual markers are then added.
   * Finally the MarkerClusterGroup is added to the map.
   */
  private async updateMarker(complete?: () => void) {
    if (this.markerClusterGroup && this.markerClusterGroup.getLayers().length) {
      this.markerClusterGroup.clearLayers();
    }

    this.markerClusterGroup = L.markerClusterGroup({
      maxClusterRadius: 60,
      polygonOptions: {
        fillColor: "#000",
        color: "#000",
        weight: 4,
        opacity: 0.5,
        fillOpacity: 0.2,
      },
    });

    this.itemList.map((item: any[]) => {
      let marker: CustomMarker;
      marker = new CustomMarker(
        item[0],
        L.latLng(item[1][0], item[1][1]),
        {
          icon: L.icon({
            iconUrl: `assets/svg-icons/${this.searchService.mapShopTypesToImage(
              item[2],
            )
              }`,
            iconSize: [36, 42],
            popupAnchor: [0, -20],
            className: item[3] ? 'marker-former' : '',
          }),
        },
      );

      marker.bindPopup(
        () => {
          return "Lade Daten...";
        },
        {
          autoPanPadding: new L.Point(65, 65),
          maxWidth: this.internal ? 420 : 300,
        },
      );

      marker.off("click");
      marker.addEventListener("click", (event: L.LeafletEvent) => {
        const eventMarker: CustomMarker = event.target as CustomMarker;
        if (this.router.isActive(`${eventMarker.getId()}`, true)) {
          eventMarker.togglePopup();
        } else {
          this.router.navigate([eventMarker.getId()]);
        }
      });

      marker.addEventListener("popupopen", (event: L.LeafletEvent) => {
        const eventMarker: CustomMarker = event.target as CustomMarker;
        this.searchService
          .itemDetails(marker.getId())
          .subscribe((itemDetails: Item) => {
            this.selectedItem = itemDetails;
            marker.setPopupContent(shopPopupHtml(itemDetails, this.internal));
          });
      });
      //
      if (this.markerClusterGroup) {
        marker.addTo(this.markerClusterGroup);
      }
    });

    if (this.map) {
      this.markerClusterGroup.addTo(this.map);
    }

    if (complete) {
      complete();
    }
  }

  public async search(searchKeyword: string) {
    this.searchService
      .search(searchKeyword)
      .subscribe((searchResults: SearchResult[]) => {
        this.searchResults = searchResults;
      });
  }

  public distanceByLatLong(lat1: string, lon1: string, lat2: number, lon2: number): number {
    const lat1Number = Number.parseFloat(lat1);
    const lon1Number = Number.parseFloat(lon1);
    return Math.round(distanceByLatLong(lat1Number, lon1Number, lat2, lon2));
  }

  /**
   * Show details in a popup window about a specific shop
   *
   * @param itemId
   */
  public showDetails(itemId: number | string) {
    if (typeof itemId === "string") {
      itemId = parseInt(itemId, 10);
    }
    if (this.searchResults) {
      this.clearSearchResults();
    }
    if (this.markerClusterGroup && this.map) {
      const targetMarker: L.Layer | undefined = this.markerClusterGroup
        .getLayers()
        .find((layer: any) => {
          return itemId === layer.getId();
        });
      if (targetMarker) {
        const marker = targetMarker as CustomMarker;
        const markerBounds = L.latLngBounds([marker.getLatLng()]);
        this.map.fitBounds(markerBounds);
        marker.openPopup();
      }
    }
  }

  private startMarkerLoad() {
    this.loadMarkers()
      .subscribe((itemList) => {
        this.itemList = itemList;
        this.updateMarker(() => {
          this.route.params.subscribe((params: Params) => {
            if (params.item) {
              this.showDetails(params.item);
            }
          });
        });
      });
  }

  private applyAddressGroups(groups: { id: string; name: string }[]) {
    const next: { [id: string]: SelectItem } = {};
    if (!Array.isArray(groups)) {
      this.addressGroups = next;
      return;
    }
    groups.forEach(group => {
      const id = `${group.id}`;
      const current = this.addressGroups[id];
      next[id] = {
        id,
        name: group.name,
        value: current ? current.value : true,
      };
    });
    this.addressGroups = next;
  }

  /**
   * Load and update new marker based on the selected filter
   */
  private loadMarkers() {
    return this.searchService.itemList(
      this.enabledOffertypes(),
      this.enabledCountries(),
      this.enabledProducts(),
      this.internalFilters(),
    );
  }

  private internalFilters() {
    if (!this.internal) {
      return undefined;
    }
    const filters: { status: string[]; visibility: string[]; states: string[]; groups?: string[] } = {
      status: this.enabledIds(this.statuses),
      visibility: this.enabledIds(this.visibility),
      states: this.enabledIds(this.states),
    };
    const ids = Object.keys(this.addressGroups);
    const enabled = this.enabledIds(this.addressGroups);
    if (ids.length > 0 && enabled.length !== ids.length) {
      filters.groups = enabled;
    }
    return filters;
  }

  private filterItems(): void {
    this.loadMarkers()
      .subscribe(itemList => {
        this.itemList = itemList;
        this.updateMarker();
      });
  }

  public toggleCountry(country: string) {
    this.countriesState[country] = !this.countriesState[country];
    this.filterItems();
  }

  /**
   * Returns a list of strings of enabled "offertypes" which are essentially categories.
   *
   * All enabled offertypes are shown in the UI as buttons that have a dark text color.
   * Buttons with light text color represents disabled offertypes.
   */
  public enabledOffertypes(): string[] {
    return this.enabledIds(this.offertypes);
  }

  public enabledProducts(): string[] {
    return this.enabledIds(this.products);
  }

  private enabledIds(items: { [id: string]: SelectItem }): string[] {
    return Object.keys(items).filter(id => items[id].value);
  }

  public enabledCountries(): Array<string> {
    const enabledCountries = [];
    for (const country in this.countriesState) {
      if (this.countriesState[country]) {
        enabledCountries.push(country);
      }
    }
    return enabledCountries;
  }

  public offertypeFilterChanged(offertypeFilterItem: SelectItem) {
    this.offertypes[offertypeFilterItem.id].value = offertypeFilterItem.value;
    this.filterItems();
  }

  public productsFilterChanged(productsFilterItem: SelectItem) {
    this.products[productsFilterItem.id].value = productsFilterItem.value;
    this.filterItems();
  }

  public groupFilterChanged(group: { [id: string]: SelectItem }, item: SelectItem) {
    group[item.id].value = item.value;
    this.filterItems();
  }

  /**
   * Open/Closes the legend popup
   */
  public toggleLegend() {
    this.router.navigateByUrl("/legende");
  }

  /**
   * Open/Closes the imprint popup
   */
  public toggleImprint() {
    this.router.navigateByUrl("/imprint");
  }

  public clearSearchResults() {
    this.searchResults = [];
    this.debounceSearchInput.next("");
  }
}

export class CustomMarker extends L.Marker {
  private id: number;

  constructor(
    id: number,
    latlng: L.LatLngExpression,
    options?: L.MarkerOptions,
  ) {
    super(latlng, options);
    this.id = id;
  }

  public getId(): number {
    return this.id;
  }

  public setId(id: number) {
    this.id = id;
  }
}
