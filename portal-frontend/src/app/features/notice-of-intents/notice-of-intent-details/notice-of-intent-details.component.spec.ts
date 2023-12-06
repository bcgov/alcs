import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { CodeService } from '../../../services/code/code.service';
import { NoticeOfIntentDocumentDto } from '../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocumentService } from '../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentParcelService } from '../../../services/notice-of-intent-parcel/notice-of-intent-parcel.service';
import { NoticeOfIntentSubmissionDetailedDto } from '../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';

import { NoticeOfIntentDetailsComponent } from './notice-of-intent-details.component';

describe('NoticeOfIntentDetailsComponent', () => {
  let component: NoticeOfIntentDetailsComponent;
  let fixture: ComponentFixture<NoticeOfIntentDetailsComponent>;
  let mockCodeService: DeepMocked<CodeService>;
  let mockNoiDocumentService: DeepMocked<NoticeOfIntentDocumentService>;
  let mockRouter: DeepMocked<Router>;
  let mockNoiParcelService: DeepMocked<NoticeOfIntentParcelService>;

  let noiDocumentPipe = new BehaviorSubject<NoticeOfIntentDocumentDto[]>([]);

  beforeEach(async () => {
    mockCodeService = createMock();
    mockNoiDocumentService = createMock();
    mockRouter = createMock();
    mockNoiParcelService = createMock();

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
          provide: NoticeOfIntentParcelService,
          useValue: mockNoiParcelService,
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
