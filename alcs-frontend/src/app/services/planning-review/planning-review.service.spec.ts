import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { ToastService } from '../toast/toast.service';
import { PlanningReviewService } from './planning-review.service';

describe('PlanningReviewService', () => {
  let service: PlanningReviewService;
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
    service = TestBed.inject(PlanningReviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call post for create', async () => {
    httpClient.post.mockReturnValue(
      of({
        fileNumber: '1',
      })
    );

    await service.create({
      fileNumber: '1',
      localGovernmentUuid: '',
      regionCode: '',
      type: '',
      boardCode: '',
    });

    expect(httpClient.post).toHaveBeenCalledTimes(1);
  });

  it('should show an error toast message if create fails', async () => {
    httpClient.post.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    const res = await service.create({
      fileNumber: '',
      localGovernmentUuid: '',
      regionCode: '',
      type: '',
      boardCode: '',
    });

    expect(httpClient.post).toHaveBeenCalledTimes(1);
    expect(res).toBeUndefined();
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should fetch planning reviews by card', async () => {
    httpClient.get.mockReturnValue(
      of({
        fileNumber: '1',
      })
    );

    const res = await service.fetchByCardUuid('1');

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.fileNumber).toEqual('1');
  });

  it('should show an error toast message if fetch by card fails', async () => {
    httpClient.get.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    const res = await service.fetchByCardUuid('1');

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeUndefined();
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });
});
