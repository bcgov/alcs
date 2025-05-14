import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { CodeService } from '../../../../services/code/code.service';
import { NoticeOfIntentDocumentDto } from '../../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocumentService } from '../../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentSubmissionDetailedDto } from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { NoticeOfIntentSubmissionService } from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.service';
import { ToastService } from '../../../../services/toast/toast.service';

import { OtherAttachmentsComponent } from './other-attachments.component';
import { HttpClient } from '@angular/common/http';
import { DocumentService } from '../../../../services/document/document.service';

describe('OtherAttachmentsComponent', () => {
  let component: OtherAttachmentsComponent;
  let fixture: ComponentFixture<OtherAttachmentsComponent>;
  let mockAppService: DeepMocked<NoticeOfIntentSubmissionService>;
  let mockAppDocumentService: DeepMocked<NoticeOfIntentDocumentService>;
  let mockRouter: DeepMocked<Router>;
  let mockCodeService: DeepMocked<CodeService>;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockDocumentService: DeepMocked<DocumentService>;

  let noiDocumentPipe = new BehaviorSubject<NoticeOfIntentDocumentDto[]>([]);

  beforeEach(async () => {
    mockAppService = createMock();
    mockAppDocumentService = createMock();
    mockRouter = createMock();
    mockCodeService = createMock();
    mockHttpClient = createMock();
    mockDocumentService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: NoticeOfIntentSubmissionService,
          useValue: mockAppService,
        },
        {
          provide: NoticeOfIntentDocumentService,
          useValue: mockAppDocumentService,
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
        {
          provide: CodeService,
          useValue: mockCodeService,
        },
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: MatDialog,
          useValue: {},
        },
        {
          provide: ToastService,
          useValue: {},
        },
      ],
      declarations: [OtherAttachmentsComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(OtherAttachmentsComponent);
    component = fixture.componentInstance;
    component.$noiSubmission = new BehaviorSubject<NoticeOfIntentSubmissionDetailedDto | undefined>(undefined);
    component.$noiDocuments = noiDocumentPipe;

    mockCodeService.loadCodes.mockResolvedValue({
      localGovernments: [],
      applicationTypes: [],
      decisionMakers: [],
      documentTypes: [],
      naruSubtypes: [],
      noticeOfIntentTypes: [],
      regions: [],
      submissionTypes: [],
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
