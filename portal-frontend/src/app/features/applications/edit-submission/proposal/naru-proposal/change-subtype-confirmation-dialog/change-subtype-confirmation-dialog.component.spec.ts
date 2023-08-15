import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ChangeSubtypeConfirmationDialogComponent } from './change-subtype-confirmation-dialog.component';

describe('ChangeSubtypeConfirmationDialogComponent', () => {
  let component: ChangeSubtypeConfirmationDialogComponent;
  let fixture: ComponentFixture<ChangeSubtypeConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChangeSubtypeConfirmationDialogComponent],
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

    fixture = TestBed.createComponent(ChangeSubtypeConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
