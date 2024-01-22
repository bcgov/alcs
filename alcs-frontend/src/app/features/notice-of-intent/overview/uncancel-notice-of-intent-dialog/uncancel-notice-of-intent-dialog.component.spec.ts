import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoticeOfIntentSubmissionStatusService } from '../../../../services/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';

import { UncancelNoticeOfIntentDialogComponent } from './uncancel-notice-of-intent-dialog.component';

describe('UncancelNoticeOfIntentDialogComponent', () => {
  let component: UncancelNoticeOfIntentDialogComponent;
  let fixture: ComponentFixture<UncancelNoticeOfIntentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UncancelNoticeOfIntentDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        {
          provide: NoticeOfIntentSubmissionStatusService,
          useValue: {},
        },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(UncancelNoticeOfIntentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
