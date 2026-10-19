import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Location } from '@angular/common';

@Component({
    selector: 'app-legende',
    templateUrl: './legende.component.html',
    styleUrls: ['./legende.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
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
