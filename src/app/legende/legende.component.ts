import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
    selector: 'app-legende',
    templateUrl: './legende.component.html',
    styleUrls: ['./legende.component.css'],
    standalone: false
})
export class LegendeComponent implements OnInit {

  constructor(private location: Location) { }

  ngOnInit(): void {
  }

  public navigateBack() {
    this.location.back();
  }
}
