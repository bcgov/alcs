import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of } from 'rxjs';
import { ToastService } from '../../toast/toast.service';

import { PlanningReviewTimelineService } from './planning-review-timeline.service';

describe('PlanningReviewTimelineService', () => {
  let service: PlanningReviewTimelineService;
  let httpClient: DeepMocked<HttpClient>;
  let toastService: DeepMocked<ToastService>;

  beforeEach(() => {
    httpClient = createMock();
    toastService = createMock();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpClient,
          useValue: httpClient,
        },
        {
          provide: ToastService,
          useValue: toastService,
        },
      ],
    });
    service = TestBed.inject(PlanningReviewTimelineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call get to fetch timeline events', async () => {
    httpClient.get.mockReturnValue(of([]));

    const res = await service.fetchByFileNumber('1');

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res.length).toEqual(0);
  });
});
