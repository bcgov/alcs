import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApplicationSubmissionStatusService } from '../../../../services/application/application-submission-status/application-submission-status.service';

import { UncancelApplicationDialogComponent } from './uncancel-application-dialog.component';

describe('UncancelApplicationDialogComponent', () => {
  let component: UncancelApplicationDialogComponent;
  let fixture: ComponentFixture<UncancelApplicationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UncancelApplicationDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        {
          provide: ApplicationSubmissionStatusService,
          useValue: {},
        },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(UncancelApplicationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
