import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NoticeOfIntentDocumentDto } from '../../../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocumentService } from '../../../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentSubmissionDetailedDto } from '../../../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { NoticeOfIntentSubmissionService } from '../../../../../services/notice-of-intent-submission/notice-of-intent-submission.service';

import { RosoProposalComponent } from './roso-proposal.component';

describe('RosoProposalComponent', () => {
  let component: RosoProposalComponent;
  let fixture: ComponentFixture<RosoProposalComponent>;
  let mockNOISubmissionService: DeepMocked<NoticeOfIntentSubmissionService>;
  let mockNOIDocumentService: DeepMocked<NoticeOfIntentDocumentService>;
  let mockRouter: DeepMocked<Router>;

  let noiDocumentPipe = new BehaviorSubject<NoticeOfIntentDocumentDto[]>([]);

  beforeEach(async () => {
    mockNOISubmissionService = createMock();
    mockRouter = createMock();
    mockNOIDocumentService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: NoticeOfIntentSubmissionService,
          useValue: mockNOISubmissionService,
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
        {
          provide: NoticeOfIntentDocumentService,
          useValue: mockNOIDocumentService,
        },
        {
          provide: MatDialog,
          useValue: {},
        },
      ],
      declarations: [RosoProposalComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RosoProposalComponent);
    component = fixture.componentInstance;
    component.$noiSubmission = new BehaviorSubject<NoticeOfIntentSubmissionDetailedDto | undefined>(undefined);
    component.$noiDocuments = noiDocumentPipe;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
