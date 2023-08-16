import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { CodeService } from '../../../services/code/code.service';
import { NoticeOfIntentDocumentDto } from '../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocumentService } from '../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentSubmissionDetailedDto } from '../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { NoticeOfIntentSubmissionService } from '../../../services/notice-of-intent-submission/notice-of-intent-submission.service';
import { ToastService } from '../../../services/toast/toast.service';

import { NoticeOfIntentDetailsComponent } from './notice-of-intent-details.component';

describe('NoticeOfIntentDetailsComponent', () => {
  let component: NoticeOfIntentDetailsComponent;
  let fixture: ComponentFixture<NoticeOfIntentDetailsComponent>;
  let mockCodeService: DeepMocked<CodeService>;
  let mockNoiDocumentService: DeepMocked<NoticeOfIntentDocumentService>;
  let mockRouter: DeepMocked<Router>;
  let mockToastService: DeepMocked<ToastService>;
  let mockNoiSubmissionService: DeepMocked<NoticeOfIntentSubmissionService>;

  let noiDocumentPipe = new BehaviorSubject<NoticeOfIntentDocumentDto[]>([]);

  beforeEach(async () => {
    mockCodeService = createMock();
    mockNoiDocumentService = createMock();
    mockRouter = createMock();
    mockNoiSubmissionService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: CodeService,
          useValue: mockCodeService,
        },
        {
          provide: NoticeOfIntentDocumentService,
          useValue: mockNoiDocumentService,
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
        {
          provide: ToastService,
          useValue: mockToastService,
        },
        {
          provide: NoticeOfIntentSubmissionService,
          useValue: mockNoiSubmissionService,
        },
      ],
      declarations: [NoticeOfIntentDetailsComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NoticeOfIntentDetailsComponent);
    component = fixture.componentInstance;
    component.$noticeOfIntentSubmission = new BehaviorSubject<NoticeOfIntentSubmissionDetailedDto | undefined>(
      undefined
    );
    component.$noiDocuments = noiDocumentPipe;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
