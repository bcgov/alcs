import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { ApplicationProposalReviewDto } from '../../../services/application-review/application-proposal-review.dto';
import { ApplicationProposalReviewService } from '../../../services/application-review/application-proposal-review.service';
import { ApplicationProposalDto } from '../../../services/application/application-proposal.dto';
import { ApplicationProposalService } from '../../../services/application/application-proposal.service';

import { ReviewAttachmentsComponent } from './review-attachments.component';

describe('ReviewAttachmentsComponent', () => {
  let component: ReviewAttachmentsComponent;
  let fixture: ComponentFixture<ReviewAttachmentsComponent>;
  let mockAppReviewService: DeepMocked<ApplicationProposalReviewService>;
  let mockAppService: DeepMocked<ApplicationProposalService>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;
  let mockRouter: DeepMocked<Router>;
  let applicationPipe = new BehaviorSubject<ApplicationProposalDto | undefined>(undefined);

  beforeEach(async () => {
    mockAppReviewService = createMock();
    mockAppService = createMock();
    mockRouter = createMock();
    mockAppDocumentService = createMock();
    mockAppReviewService.$applicationReview = new BehaviorSubject<ApplicationProposalReviewDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      declarations: [ReviewAttachmentsComponent],
      providers: [
        {
          provide: ApplicationProposalReviewService,
          useValue: mockAppReviewService,
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
        {
          provide: ApplicationProposalService,
          useValue: mockAppService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocumentService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewAttachmentsComponent);
    component = fixture.componentInstance;
    component.$application = applicationPipe;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
