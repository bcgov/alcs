import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { ApplicationProposalReviewDto } from '../../../services/application-review/application-proposal-review.dto';
import { ApplicationProposalReviewService } from '../../../services/application-review/application-proposal-review.service';
import { ApplicationProposalDto } from '../../../services/application/application-proposal.dto';
import { ApplicationProposalService } from '../../../services/application/application-proposal.service';

import { ReviewSubmitFngComponent } from './review-submit-fng.component';

describe('ReviewSubmitComponent', () => {
  let component: ReviewSubmitFngComponent;
  let fixture: ComponentFixture<ReviewSubmitFngComponent>;
  let mockAppReviewService: DeepMocked<ApplicationProposalReviewService>;
  let mockAppService: DeepMocked<ApplicationProposalService>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;

  let applicationPipe = new BehaviorSubject<ApplicationProposalDto | undefined>(undefined);

  beforeEach(async () => {
    mockAppReviewService = createMock();
    mockAppReviewService.$applicationReview = new BehaviorSubject<ApplicationProposalReviewDto | undefined>(undefined);
    mockAppDocumentService = createMock();

    mockAppService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationProposalReviewService,
          useValue: mockAppReviewService,
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
      declarations: [ReviewSubmitFngComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewSubmitFngComponent);
    component = fixture.componentInstance;

    component.$application = applicationPipe;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
