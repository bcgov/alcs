import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NoticeOfIntentMeetingDto } from '../../../services/notice-of-intent/meeting/notice-of-intent-meeting.dto';
import { NoticeOfIntentMeetingService } from '../../../services/notice-of-intent/meeting/notice-of-intent-meeting.service';
import { NoticeOfIntentDetailService } from '../../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentDto } from '../../../services/notice-of-intent/notice-of-intent.dto';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

import { InfoRequestsComponent } from './info-requests.component';

describe('InfoRequestsComponent', () => {
  let component: InfoRequestsComponent;
  let fixture: ComponentFixture<InfoRequestsComponent>;

  let mockNoticeOfIntentMeetingService: DeepMocked<NoticeOfIntentMeetingService>;
  let mockConfirmationDialogService: DeepMocked<ConfirmationDialogService>;
  let mockNoticeOfIntentDetailService: DeepMocked<NoticeOfIntentDetailService>;

  beforeEach(async () => {
    mockNoticeOfIntentMeetingService = createMock();
    mockConfirmationDialogService = createMock();
    mockNoticeOfIntentDetailService = createMock();

    await TestBed.configureTestingModule({
      declarations: [InfoRequestsComponent],
      providers: [
        {
          provide: NoticeOfIntentMeetingService,
          useValue: mockNoticeOfIntentMeetingService,
        },
        {
          provide: ConfirmationDialogService,
          useValue: mockConfirmationDialogService,
        },
        {
          provide: NoticeOfIntentDetailService,
          useValue: mockNoticeOfIntentDetailService,
        },
        {
          provide: MatDialogRef,
          useValue: {},
        },
        {
          provide: MatDialog,
          useValue: {},
        },
      ],
      imports: [HttpClientTestingModule, MatSnackBarModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    mockNoticeOfIntentDetailService.$noticeOfIntent = new BehaviorSubject<NoticeOfIntentDto | undefined>(undefined);
    mockNoticeOfIntentMeetingService.$meetings = new BehaviorSubject<NoticeOfIntentMeetingDto[]>([]);

    fixture = TestBed.createComponent(InfoRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
