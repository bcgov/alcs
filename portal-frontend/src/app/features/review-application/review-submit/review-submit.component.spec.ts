import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { ApplicationReviewDto } from '../../../services/application-review/application-review.dto';
import { ApplicationReviewService } from '../../../services/application-review/application-review.service';
import { ApplicationDto } from '../../../services/application/application.dto';

import { ReviewSubmitComponent } from './review-submit.component';

describe('ReviewSubmitComponent', () => {
  let component: ReviewSubmitComponent;
  let fixture: ComponentFixture<ReviewSubmitComponent>;
  let mockAppReviewService: DeepMocked<ApplicationReviewService>;

  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;

  let applicationPipe = new BehaviorSubject<ApplicationDto | undefined>(undefined);

  beforeEach(async () => {
    mockAppReviewService = createMock();
    mockAppReviewService.$applicationReview = new BehaviorSubject<ApplicationReviewDto | undefined>(undefined);

    mockAppDocumentService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationReviewService,
          useValue: mockAppReviewService,
        },

        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocumentService,
        },
      ],
      declarations: [ReviewSubmitComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewSubmitComponent);
    component = fixture.componentInstance;

    component.$application = applicationPipe;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
