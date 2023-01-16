import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParcelDetailsComponent } from './parcel-details.component';

describe('ParcelDetailsComponent', () => {
  let component: ParcelDetailsComponent;
  let fixture: ComponentFixture<ParcelDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParcelDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParcelDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
