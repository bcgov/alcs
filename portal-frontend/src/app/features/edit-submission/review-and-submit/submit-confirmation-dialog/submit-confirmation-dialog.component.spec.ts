import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SubmitConfirmationDialogComponent } from './submit-confirmation-dialog.component';

describe('OtherParcelConfirmationDialogComponent', () => {
  let component: SubmitConfirmationDialogComponent;
  let fixture: ComponentFixture<SubmitConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubmitConfirmationDialogComponent],
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

    fixture = TestBed.createComponent(SubmitConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
