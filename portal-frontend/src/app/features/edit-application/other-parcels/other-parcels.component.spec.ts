import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherParcelsComponent } from './other-parcels.component';

describe('OtherParcelsComponent', () => {
  let component: OtherParcelsComponent;
  let fixture: ComponentFixture<OtherParcelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtherParcelsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherParcelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
