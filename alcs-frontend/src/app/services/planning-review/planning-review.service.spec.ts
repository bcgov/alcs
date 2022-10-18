import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ToastService } from '../toast/toast.service';

import { PlanningReviewService } from './planning-review.service';

describe('PlanningReviewService', () => {
  let service: PlanningReviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: ToastService,
          useValue: {},
        },
      ],
    });
    service = TestBed.inject(PlanningReviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
