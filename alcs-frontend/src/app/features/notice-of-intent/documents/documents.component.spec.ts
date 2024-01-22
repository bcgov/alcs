import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NoiDocumentService } from '../../../services/notice-of-intent/noi-document/noi-document.service';
import { NoticeOfIntentDetailService } from '../../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentSubmissionStatusService } from '../../../services/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import { NoticeOfIntentDto } from '../../../services/notice-of-intent/notice-of-intent.dto';
import { ToastService } from '../../../services/toast/toast.service';

import { NoiDocumentsComponent } from './documents.component';

describe('NoiDocumentsComponent', () => {
  let component: NoiDocumentsComponent;
  let fixture: ComponentFixture<NoiDocumentsComponent>;
  let mockNoiDocService: DeepMocked<NoiDocumentService>;
  let mockNoiDetailService: DeepMocked<NoticeOfIntentDetailService>;
  let mockDialog: DeepMocked<MatDialog>;
  let mockToastService: DeepMocked<ToastService>;
  let mockNoiSubStatusService: DeepMocked<NoticeOfIntentSubmissionStatusService>;

  beforeEach(async () => {
    mockNoiDocService = createMock();
    mockNoiDetailService = createMock();
    mockDialog = createMock();
    mockToastService = createMock();
    mockNoiDetailService.$noticeOfIntent = new BehaviorSubject<NoticeOfIntentDto | undefined>(undefined);
    mockNoiSubStatusService = createMock();

    await TestBed.configureTestingModule({
      declarations: [NoiDocumentsComponent],
      providers: [
        {
          provide: NoiDocumentService,
          useValue: mockNoiDocService,
        },
        {
          provide: NoticeOfIntentDetailService,
          useValue: mockNoiDetailService,
        },
        {
          provide: MatDialog,
          useValue: mockDialog,
        },
        {
          provide: ToastService,
          useValue: mockToastService,
        },
        {
          provide: NoticeOfIntentSubmissionStatusService,
          useValue: mockNoiSubStatusService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NoiDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
