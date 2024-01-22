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

describe('NoticeOfIntentDetailsComponent', () => {
  let component: NotificationDetailsComponent;
  let fixture: ComponentFixture<NotificationDetailsComponent>;
  let mockCodeService: DeepMocked<CodeService>;
  let mockDocumentService: DeepMocked<NotificationDocumentService>;
  let mockRouter: DeepMocked<Router>;

  let documentPipe = new BehaviorSubject<NotificationDocumentDto[]>([]);

  beforeEach(async () => {
    mockCodeService = createMock();
    mockDocumentService = createMock();
    mockRouter = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: CodeService,
          useValue: mockCodeService,
        },
        {
          provide: NotificationDocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: Router,
          useValue: mockRouter,
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
