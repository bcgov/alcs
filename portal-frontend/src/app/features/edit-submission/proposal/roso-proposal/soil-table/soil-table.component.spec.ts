import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoilTableComponent } from './soil-table.component';

describe('SoilTableComponent', () => {
  let component: SoilTableComponent;
  let fixture: ComponentFixture<SoilTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SoilTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoilTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
