import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationProposalReviewDto } from '../../../services/application-review/application-proposal-review.dto';
import { ApplicationProposalReviewService } from '../../../services/application-review/application-proposal-review.service';

import { ReviewContactInformationComponent } from './review-contact-information.component';

describe('ReviewContactInformationComponent', () => {
  let component: ReviewContactInformationComponent;
  let fixture: ComponentFixture<ReviewContactInformationComponent>;
  let mockAppReviewService: DeepMocked<ApplicationProposalReviewService>;
  let mockRouter: DeepMocked<Router>;

  beforeEach(async () => {
    mockAppReviewService = createMock();
    mockAppReviewService.$applicationReview = new BehaviorSubject<ApplicationProposalReviewDto | undefined>(undefined);

    mockRouter = createMock();

    await TestBed.configureTestingModule({
      declarations: [ReviewContactInformationComponent],
      providers: [
        {
          provide: ApplicationProposalReviewService,
          useValue: mockAppReviewService,
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewContactInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
