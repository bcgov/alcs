import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDocumentDto } from '../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../services/application-document/application-document.service';
import { ApplicationSubmissionDetailedDto } from '../../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../../services/application-submission/application-submission.service';
import { CodeService } from '../../../../services/code/code.service';
import { ToastService } from '../../../../services/toast/toast.service';

import { OtherAttachmentsComponent } from './other-attachments.component';
import { HttpClient } from '@angular/common/http';
import { DocumentService } from '../../../../services/document/document.service';

describe('OtherAttachmentsComponent', () => {
  let component: OtherAttachmentsComponent;
  let fixture: ComponentFixture<OtherAttachmentsComponent>;
  let mockAppService: DeepMocked<ApplicationSubmissionService>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;
  let mockRouter: DeepMocked<Router>;
  let mockCodeService: DeepMocked<CodeService>;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockDocumentService: DeepMocked<DocumentService>;

  let applicationDocumentPipe = new BehaviorSubject<ApplicationDocumentDto[]>([]);

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
          provide: ApplicationSubmissionService,
          useValue: mockAppService,
        },
        {
          provide: ApplicationDocumentService,
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
    component.$applicationSubmission = new BehaviorSubject<ApplicationSubmissionDetailedDto | undefined>(undefined);
    component.$applicationDocuments = applicationDocumentPipe;

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
