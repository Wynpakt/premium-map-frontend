import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownComponent } from './dropdown.component';

describe('DropdownComponent', () => {
  let component: DropdownComponent;
  let fixture: ComponentFixture<DropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DropdownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filters a long list by the typed group name', () => {
    component.searchable = true;
    component.selectItems = {
      '4': { id: '4', name: 'Interessent', value: true },
      '9': { id: '9', name: 'Händler', value: true },
    };
    component.query = 'inter';

    expect(component.getSelectItems().map(item => item.name)).toEqual(['Interessent']);

    component.query = '';
    expect(component.getSelectItems().map(item => item.id)).toEqual(['4', '9']);
  });
});
