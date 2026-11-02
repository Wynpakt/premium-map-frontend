import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable()
export class SearchService {
  private host = environment.apiHost;
  private searchPath = '/search';
  private itemListPath = '/item/list';
  private itemAllPath = '/item/all';
  private itemDetailsPath = '/item';

  constructor(private http: HttpClient) {}

  /**
   * @param keyword the keyword to search for
   */
  public search(keyword: string): Observable<SearchResult[]> {
    let url = `${this.host}${this.searchPath}`;
    if (keyword !== '') {
      url += `/${keyword}`;
    }
    return this.http
      .get<any>(url)
      .pipe(map(res => res.data.items as SearchResult[]));
  }

  public itemDetails(id: number): Observable<Item> {
    const url = `${this.host}${this.itemDetailsPath}/${id}`;
    return this.http.get<any>(url).pipe(map(res => res.data as Item));
  }

  // https://<host>/item/list?types[]=haendler&types[]=sprecher&types[]=webshop
  public itemList(
    types: string[],
    countries: string[],
    products: string[]
  ): Observable<any[]> {
    let url = `${this.host}${this.itemListPath}`;
    url += `?types[]=${types.join('&types[]=')}`;
    url += `&countries[]=${countries.join('&countries[]=')}`;
    url += `&products[]=${products.join('&products[]=')}`;
    return this.http
      .get<any>(url)
      .pipe(map(itemList => itemList.data as any[]));
  }

  public itemAll() {
    const url = `${this.host}${this.itemAllPath}`;
    return this.http
      .get<any>(url)
      .pipe(map(itemList => itemList.data as any[]));
  }

  /**
   * This function returns the svg filename for the specified shop type list
   * which is than used in the search result.
   *
   * @param shopTypes A list of shop types e.g.: ["3", "2"]
   */
  public mapShopTypesToImage(shopTypes: Array<string>) {
    const normalizedShopTypes: string[] = [];
    shopTypes.map(item => {
      normalizedShopTypes.push(`${item}`);
    });

    let abbriviation = '';
    let hash = '';

    // s = Sprecher/lokaler Kontakt, h = Haendler
    if (
      normalizedShopTypes.indexOf('3') > -1 &&
      normalizedShopTypes.indexOf('2') > -1
    ) {
      abbriviation = 'sh';
      hash = '31e7eb2623d14e4f902f9538e5b8dd6ec1a8b32d7e2f30ed1839b6672b384875';
      // s = Sprecher/lokaler Kontakt, l = Laden
    } else if (
      normalizedShopTypes.indexOf('3') > -1 &&
      normalizedShopTypes.indexOf('1') > -1
    ) {
      abbriviation = 'sl';
      hash = '1b7c1e267d798113591df7c23dbe558813f6718c4db348e341c5ef09220d87f4';
      // l = Laden, h = Haendler
    } else if (
      normalizedShopTypes.indexOf('1') > -1 &&
      normalizedShopTypes.indexOf('2') > -1
    ) {
      abbriviation = 'h';
      hash = 'e30564530d085950c9d25baf877b72bede18682696a01332803249a20f5f6a8d';
      // h = haendler, o = Onlinehandel
    } else if (
      normalizedShopTypes.indexOf('2') > -1 &&
      normalizedShopTypes.indexOf('4') > -1
    ) {
      abbriviation = 'h';
      hash = 'e30564530d085950c9d25baf877b72bede18682696a01332803249a20f5f6a8d';
      // l = laden, o = Onlinehandel
    } else if (
      normalizedShopTypes.indexOf('1') > -1 &&
      normalizedShopTypes.indexOf('4') > -1
    ) {
      abbriviation = 'l';
      hash = 'b3124d196493d83e9aa500089c5ce67490a7cec1847fce891842f2d3cbf31f1f';
      // l = Laden
    } else if (
      normalizedShopTypes.indexOf('1') > -1 &&
      normalizedShopTypes.length === 1
    ) {
      abbriviation = 'l';
      hash = 'b3124d196493d83e9aa500089c5ce67490a7cec1847fce891842f2d3cbf31f1f';
      // h = Haendler
    } else if (
      normalizedShopTypes.indexOf('2') > -1 &&
      normalizedShopTypes.length === 1
    ) {
      abbriviation = 'h';
      hash = 'e30564530d085950c9d25baf877b72bede18682696a01332803249a20f5f6a8d';
      // s = Sprecher/lokaler Kontakt
    } else if (
      normalizedShopTypes.indexOf('3') > -1 &&
      normalizedShopTypes.length === 1
    ) {
      abbriviation = 's';
      hash = '58b6019d3d0c125cc029d122ca9fa075cd77023d4bade1f67bc67e077525d486';
      // o = Onlinehandel
    } else if (
      normalizedShopTypes.indexOf('4') > -1 &&
      normalizedShopTypes.length === 1
    ) {
      abbriviation = 'o';
      hash = '46085aa61342e805eb5bfb6fa9e2f6b96e95a45a01ab2e58d9f33a3aa74ef0ae';
    }

    return `${['marker-icon', abbriviation].join('-')}.${hash}.svg`;
  }
}

export interface SearchResult {
  id: number;
  email: string;
  lat: string;
  lng: string;
  name: string;
  offertypes: Array<string>;
  uri: string;
  web: string;
  city: string;
  street: string;
  zip: string;
}

export interface Item {
  id: number;
  name: string;
  street: string;
  products: string[];
  offertypes: string[];
  city: string;
  zip: string;
  web: string;
  email: string;
  uri: string;
}

export enum ShopType {
  Laden = 1,
  Haendler = 2,
  LokalerKontakt = 3,
  Onlinehandel = 4
}
