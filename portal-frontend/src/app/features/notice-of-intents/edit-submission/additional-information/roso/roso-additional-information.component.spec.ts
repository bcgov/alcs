import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NoticeOfIntentDocumentDto } from '../../../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocumentService } from '../../../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentSubmissionDetailedDto } from '../../../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { NoticeOfIntentSubmissionService } from '../../../../../services/notice-of-intent-submission/notice-of-intent-submission.service';

import { RosoAdditionalInformationComponent } from './roso-additional-information.component';

describe('RosoAdditionalInformationComponent', () => {
  let component: RosoAdditionalInformationComponent;
  let fixture: ComponentFixture<RosoAdditionalInformationComponent>;
  let mockNoticeOfIntentSubmissionService: DeepMocked<NoticeOfIntentSubmissionService>;
  let mockNoticeOfIntentDocumentService: DeepMocked<NoticeOfIntentDocumentService>;

  beforeEach(async () => {
    mockNoticeOfIntentSubmissionService = createMock();
    mockNoticeOfIntentDocumentService = createMock();
    await TestBed.configureTestingModule({
      declarations: [RosoAdditionalInformationComponent],
      providers: [
        { provide: MatDialog, useValue: {} },
        {
          provide: NoticeOfIntentSubmissionService,
          useValue: mockNoticeOfIntentSubmissionService,
        },
        { provide: NoticeOfIntentDocumentService, useValue: mockNoticeOfIntentDocumentService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RosoAdditionalInformationComponent);
    component = fixture.componentInstance;
    component.$noiSubmission = new BehaviorSubject<NoticeOfIntentSubmissionDetailedDto | undefined>(undefined);
    component.$noiDocuments = new BehaviorSubject<NoticeOfIntentDocumentDto[]>([]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
