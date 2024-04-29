import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { ToastService } from '../toast/toast.service';
import { PlanningReferralService } from './planning-referral.service';

describe('PlanningReferralService', () => {
  let service: PlanningReferralService;
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
    service = TestBed.inject(PlanningReferralService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call get for fetchByCardUuid', async () => {
    httpClient.get.mockReturnValue(
      of({
        fileNumber: '1',
      }),
    );

    await service.fetchByCardUuid('card-uuid');

    expect(httpClient.get).toHaveBeenCalledTimes(1);
  });

  it('should show an error toast message if fetchByCardUuid fails', async () => {
    httpClient.get.mockReturnValue(
      throwError(() => {
        new Error('');
      }),
    );

    const res = await service.fetchByCardUuid('card-uuid');

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeUndefined();
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should call post for create', async () => {
    httpClient.post.mockReturnValue(
      of({
        fileNumber: '1',
      }),
    );

    await service.create({
      planningReviewUuid: '',
      referralDescription: '',
      submissionDate: 0,
    });

    expect(httpClient.post).toHaveBeenCalledTimes(1);
  });

  it('should show an error toast message if create fails', async () => {
    httpClient.post.mockReturnValue(
      throwError(() => {
        new Error('');
      }),
    );

    const res = await service.create({
      planningReviewUuid: '',
      referralDescription: '',
      submissionDate: 0,
    });

    expect(httpClient.post).toHaveBeenCalledTimes(1);
    expect(res).toBeUndefined();
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should call patch for update', async () => {
    httpClient.patch.mockReturnValue(
      of({
        fileNumber: '1',
      }),
    );

    await service.update('', {
      referralDescription: '',
      submissionDate: 0,
    });

    expect(httpClient.patch).toHaveBeenCalledTimes(1);
  });

  it('should show an error toast message if update fails', async () => {
    httpClient.patch.mockReturnValue(
      throwError(() => {
        new Error('');
      }),
    );

    const res = await service.update('', {
      referralDescription: '',
      submissionDate: 0,
    });

    expect(httpClient.patch).toHaveBeenCalledTimes(1);
    expect(res).toBeUndefined();
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should call delete for delete', async () => {
    httpClient.delete.mockReturnValue(
      of({
        fileNumber: '1',
      }),
    );

    await service.delete('');

    expect(httpClient.delete).toHaveBeenCalledTimes(1);
  });

  it('should show an error toast message if delete fails', async () => {
    httpClient.delete.mockReturnValue(
      throwError(() => {
        new Error('');
      }),
    );

    const res = await service.delete('');

    expect(httpClient.delete).toHaveBeenCalledTimes(1);
    expect(res).toBeUndefined();
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });
});
