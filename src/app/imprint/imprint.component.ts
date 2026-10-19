import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
    selector: 'app-imprint',
    templateUrl: './imprint.component.html',
    styleUrls: ['./imprint.component.css'],
    standalone: false
})
export class ImprintComponent implements OnInit {

  constructor(private location: Location) { }

  ngOnInit(): void {
  }

  public navigateHome() {
    this.location.back();
  }

}
