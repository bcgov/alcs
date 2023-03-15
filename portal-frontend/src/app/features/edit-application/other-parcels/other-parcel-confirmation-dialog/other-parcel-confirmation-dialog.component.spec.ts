import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { OtherParcelConfirmationDialogComponent } from './other-parcel-confirmation-dialog.component';

describe('OtherParcelConfirmationDialogComponent', () => {
  let component: OtherParcelConfirmationDialogComponent;
  let fixture: ComponentFixture<OtherParcelConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OtherParcelConfirmationDialogComponent],
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

    fixture = TestBed.createComponent(OtherParcelConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
