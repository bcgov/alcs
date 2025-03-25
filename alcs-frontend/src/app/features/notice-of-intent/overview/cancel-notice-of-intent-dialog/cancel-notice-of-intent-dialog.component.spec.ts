import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CancelNoticeOfIntentDialogComponent } from './cancel-notice-of-intent-dialog.component';
import { NoticeOfIntentSubmissionStatusService } from '../../../../services/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';

describe('CancelNoticeOfIntentDialogComponent', () => {
  let component: CancelNoticeOfIntentDialogComponent;
  let fixture: ComponentFixture<CancelNoticeOfIntentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CancelNoticeOfIntentDialogComponent],
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

    fixture = TestBed.createComponent(CancelNoticeOfIntentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
