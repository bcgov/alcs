import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationSubmissionReviewService } from '../../../../services/application-submission-review/application-submission-review.service';

import { AlcReviewComponent } from './alc-review.component';

describe('AlcsReviewComponent', () => {
  let component: AlcReviewComponent;
  let fixture: ComponentFixture<AlcReviewComponent>;
  let mockAppReviewService: DeepMocked<ApplicationSubmissionReviewService>;

  beforeEach(async () => {
    mockAppReviewService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationSubmissionReviewService,
          useValue: mockAppReviewService,
        },
      ],
      declarations: [AlcReviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AlcReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
