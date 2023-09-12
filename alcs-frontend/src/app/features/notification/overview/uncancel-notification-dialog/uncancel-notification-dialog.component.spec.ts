import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificationSubmissionStatusService } from '../../../../services/notification/notification-submission-status/notification-submission-status.service';

import { UncancelNotificationDialogComponent } from './uncancel-notification-dialog.component';

describe('UncancelNotificationDialogComponent', () => {
  let component: UncancelNotificationDialogComponent;
  let fixture: ComponentFixture<UncancelNotificationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UncancelNotificationDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        {
          provide: NotificationSubmissionStatusService,
          useValue: {},
        },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(UncancelNotificationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
