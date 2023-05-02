import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ParcelEntryConfirmationDialogComponent } from './parcel-entry-confirmation-dialog.component';

describe('ParcelEntryConfirmationDialogComponent', () => {
  let component: ParcelEntryConfirmationDialogComponent;
  let fixture: ComponentFixture<ParcelEntryConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParcelEntryConfirmationDialogComponent],
      providers: [
        {
          provide: MatDialog,
          useValue: {},
        },
        {
          provide: MatDialogRef,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ParcelEntryConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
