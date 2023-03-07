import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherParcelConfirmationDialogComponent } from './other-parcel-confirmation-dialog.component';

describe('OtherParcelConfirmationDialogComponent', () => {
  let component: OtherParcelConfirmationDialogComponent;
  let fixture: ComponentFixture<OtherParcelConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtherParcelConfirmationDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherParcelConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
