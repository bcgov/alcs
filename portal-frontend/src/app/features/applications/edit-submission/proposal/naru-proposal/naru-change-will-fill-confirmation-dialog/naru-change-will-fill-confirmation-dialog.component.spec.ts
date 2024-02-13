import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NaruChangeWillFillConfirmationDialogComponent } from './naru-change-will-fill-confirmation-dialog.component';

describe('NaruChangeWillFillConfirmationDialogComponent', () => {
  let component: NaruChangeWillFillConfirmationDialogComponent;
  let fixture: ComponentFixture<NaruChangeWillFillConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NaruChangeWillFillConfirmationDialogComponent],
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

    fixture = TestBed.createComponent(NaruChangeWillFillConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
