import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { firstValueFrom } from 'rxjs';
import { PlanningReviewDetailService } from './planning-review-detail.service';
import { PlanningReviewDetailedDto } from './planning-review.dto';
import { PlanningReviewService } from './planning-review.service';

describe('PlanningReviewDetailService', () => {
  let service: PlanningReviewDetailService;
  let mockPlanningReviewService: DeepMocked<PlanningReviewService>;

  beforeEach(() => {
    mockPlanningReviewService = createMock();

    TestBed.configureTestingModule({
      providers: [
        PlanningReviewDetailService,
        {
          provide: PlanningReviewService,
          useValue: mockPlanningReviewService,
        },
      ],
    });
    service = TestBed.inject(PlanningReviewDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should publish the loaded application', async () => {
    mockPlanningReviewService.fetchDetailedByFileNumber.mockResolvedValue({
      fileNumber: '1',
    } as PlanningReviewDetailedDto);

    await service.loadReview('1');
    const res = await firstValueFrom(service.$planningReview);

    expect(mockPlanningReviewService.fetchDetailedByFileNumber).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.fileNumber).toEqual('1');
  });

  it('should publish the updated application for update', async () => {
    mockPlanningReviewService.update.mockResolvedValue({
      fileNumber: '1',
    } as PlanningReviewDetailedDto);

    await service.update('1', {});
    const res = await firstValueFrom(service.$planningReview);

    expect(mockPlanningReviewService.update).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.fileNumber).toEqual('1');
  });
});
