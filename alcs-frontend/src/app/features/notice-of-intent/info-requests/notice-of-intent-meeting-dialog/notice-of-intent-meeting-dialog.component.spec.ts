import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NoticeOfIntentMeetingService } from '../../../../services/notice-of-intent/meeting/notice-of-intent-meeting.service';

import { NoticeOfIntentMeetingDialogComponent } from './notice-of-intent-meeting-dialog.component';

describe('NoticeOfIntentMeetingDialogComponent', () => {
  let component: NoticeOfIntentMeetingDialogComponent;
  let fixture: ComponentFixture<NoticeOfIntentMeetingDialogComponent>;

  let mockNoticeOfIntentMeetingService: DeepMocked<NoticeOfIntentMeetingService>;

  beforeEach(async () => {
    mockNoticeOfIntentMeetingService = createMock();

    await TestBed.configureTestingModule({
      declarations: [NoticeOfIntentMeetingDialogComponent],
      providers: [
        { provide: NoticeOfIntentMeetingService, useValue: mockNoticeOfIntentMeetingService },
        { provide: MAT_DIALOG_DATA, useValue: { meetingType: { code: 'fake', label: 'fake' } } },
        { provide: MatDialogRef, useValue: {} },
      ],
      imports: [HttpClientTestingModule, MatDialogModule, MatSnackBarModule, FormsModule, ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NoticeOfIntentMeetingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
