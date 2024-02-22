import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NoticeOfIntentDocumentDto } from '../../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocumentService } from '../../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentSubmissionDetailedDto } from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { NoticeOfIntentSubmissionService } from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { ToastService } from '../../../../services/toast/toast.service';

import { AdditionalInformationComponent } from './additional-information.component';

describe('AdditionalInformationComponent', () => {
  let component: AdditionalInformationComponent;
  let fixture: ComponentFixture<AdditionalInformationComponent>;
  let mockNoticeOfIntentSubmissionService: DeepMocked<NoticeOfIntentSubmissionService>;
  let mockNoticeOfIntentDocumentService: DeepMocked<NoticeOfIntentDocumentService>;
  let mockDialogService: DeepMocked<ConfirmationDialogService>;

  beforeEach(async () => {
    mockNoticeOfIntentSubmissionService = createMock();
    mockNoticeOfIntentDocumentService = createMock();
    await TestBed.configureTestingModule({
      declarations: [AdditionalInformationComponent],
      providers: [
        { provide: MatDialog, useValue: {} },
        {
          provide: NoticeOfIntentSubmissionService,
          useValue: mockNoticeOfIntentSubmissionService,
        },
        { provide: NoticeOfIntentDocumentService, useValue: mockNoticeOfIntentDocumentService },
        {
          provide: ConfirmationDialogService,
          useValue: mockDialogService,
        },
        {
          provide: ToastService,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AdditionalInformationComponent);
    component = fixture.componentInstance;
    component.$noiSubmission = new BehaviorSubject<NoticeOfIntentSubmissionDetailedDto | undefined>(undefined);
    component.$noiDocuments = new BehaviorSubject<NoticeOfIntentDocumentDto[]>([]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
