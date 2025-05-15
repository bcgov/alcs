import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { CodeService } from '../../../services/code/code.service';
import { NotificationDocumentDto } from '../../../services/notification-document/notification-document.dto';
import { NotificationDocumentService } from '../../../services/notification-document/notification-document.service';
import { NotificationSubmissionDetailedDto } from '../../../services/notification-submission/notification-submission.dto';

import { NotificationDetailsComponent } from './notification-details.component';
import { HttpClient } from '@angular/common/http';
import { DocumentService } from '../../../services/document/document.service';

describe('NoticeOfIntentDetailsComponent', () => {
  let component: NotificationDetailsComponent;
  let fixture: ComponentFixture<NotificationDetailsComponent>;
  let mockCodeService: DeepMocked<CodeService>;
  let mockNotiDocumentService: DeepMocked<NotificationDocumentService>;
  let mockRouter: DeepMocked<Router>;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockDocumentService: DeepMocked<DocumentService>;

  let documentPipe = new BehaviorSubject<NotificationDocumentDto[]>([]);

  beforeEach(async () => {
    mockCodeService = createMock();
    mockNotiDocumentService = createMock();
    mockRouter = createMock();
    mockHttpClient = createMock();
    mockDocumentService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: CodeService,
          useValue: mockCodeService,
        },
        {
          provide: NotificationDocumentService,
          useValue: mockNotiDocumentService,
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
      ],
      declarations: [NotificationDetailsComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationDetailsComponent);
    component = fixture.componentInstance;
    component.$notificationSubmission = new BehaviorSubject<NotificationSubmissionDetailedDto | undefined>(undefined);
    component.$notificationDocuments = documentPipe;

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
