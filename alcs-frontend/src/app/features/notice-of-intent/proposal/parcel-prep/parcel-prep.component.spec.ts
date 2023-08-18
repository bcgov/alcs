import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParcelPrepComponent } from './parcel-prep.component';

describe('ParcelPrepComponent', () => {
  let component: ParcelPrepComponent;
  let fixture: ComponentFixture<ParcelPrepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParcelPrepComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParcelPrepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
