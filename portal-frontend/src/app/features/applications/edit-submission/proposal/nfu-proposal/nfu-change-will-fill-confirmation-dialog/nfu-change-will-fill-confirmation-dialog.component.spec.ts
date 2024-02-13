import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NfuChangeWillFillConfirmationDialogComponent } from './nfu-change-will-fill-confirmation-dialog.component';

describe('NfuChangeWillFillConfirmationDialogComponent', () => {
  let component: NfuChangeWillFillConfirmationDialogComponent;
  let fixture: ComponentFixture<NfuChangeWillFillConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NfuChangeWillFillConfirmationDialogComponent],
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

    fixture = TestBed.createComponent(NfuChangeWillFillConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
