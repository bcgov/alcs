import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParcelEntryConfirmationDialogComponent } from './parcel-entry-confirmation-dialog.component';

describe('ParcelEntryConfirmationDialogComponent', () => {
  let component: ParcelEntryConfirmationDialogComponent;
  let fixture: ComponentFixture<ParcelEntryConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParcelEntryConfirmationDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParcelEntryConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
