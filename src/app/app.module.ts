import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

import { AppRoutingModule } from "./app-routing.module";
import { SearchService } from './search.service';
import { AppComponent } from "./app.component";
import { MapComponent } from "./map/map.component";
import { DropdownComponent } from "./dropdown/dropdown.component";

@NgModule({ declarations: [
        AppComponent,
        MapComponent,
        DropdownComponent,
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule], providers: [SearchService, provideHttpClient(withXhr(), withInterceptorsFromDi())] })
export class AppModule {}
