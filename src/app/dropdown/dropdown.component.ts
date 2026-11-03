import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

export interface SelectItem {
  id: string;
  name: string;
  value: boolean;
  icon?: string;
}

@Component({
    selector: 'app-dropdown',
    templateUrl: './dropdown.component.html',
    styleUrls: ['./dropdown.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DropdownComponent implements OnInit {
  @Output() selectItemValueChanged = new EventEmitter<SelectItem>();

  @Input()
  public selectMessage: string;

  @Input()
  public minWidth: string;

  @Input()
  public menuMaxHeight = '';

  @Input()
  public searchable = false;

  @Input()
  public selectItems: {
    [id: string]: SelectItem;
  };
  public isDropdown = false;
  public query = '';

  public getSelectItems(): SelectItem[] {
    const items = Object.keys(this.selectItems).map(id => this.selectItems[id]);
    const needle = this.query.trim().toLowerCase();
    if (!this.searchable || needle === '') {
      return items;
    }
    return items.filter(item => item.name.toLowerCase().includes(needle));
  }

  public openDropdown() {
    this.isDropdown = !this.isDropdown;
  }

  public toggleProperty(id: string) {
    this.selectItems[id].value = !this.selectItems[id].value;
    this.selectItemValueChanged.emit(this.selectItems[id]);
  }

  constructor() {
    this.selectMessage = "";
    this.selectItems = {};
    this.minWidth = "0";
  }

  ngOnInit(): void {
  }

}
