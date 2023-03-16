import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { ToastService } from '../toast/toast.service';

import { ApplicationSubmissionReviewService } from './application-submission-review.service';

describe('ApplicationSubmissionReviewService', () => {
  let service: ApplicationSubmissionReviewService;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(() => {
    mockHttpClient = createMock();
    mockToastService = createMock();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
        {
          provide: ToastService,
          useValue: mockToastService,
        },
      ],
    });
    service = TestBed.inject(ApplicationSubmissionReviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make a get request for get', async () => {
    mockHttpClient.get.mockReturnValue(of({}));
    const fileId = 'file-id';
    await service.getByFileId(fileId);

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.get.mock.calls[0][0]).toContain(fileId);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(0);
  });

  it('should show an error toast if get fails', async () => {
    mockHttpClient.get.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );
    const fileId = 'file-id';
    await service.getByFileId(fileId);

    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make a post request for start', async () => {
    mockHttpClient.post.mockReturnValue(of({}));
    const fileId = 'file-id';
    await service.startReview(fileId);

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.post.mock.calls[0][0]).toContain(fileId);
    expect(mockHttpClient.post.mock.calls[0][0]).toContain('start');
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(0);
  });

  it('should show an error toast if start fails', async () => {
    mockHttpClient.post.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );
    const fileId = 'file-id';
    await service.startReview(fileId);

    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make a post request for update', async () => {
    mockHttpClient.post.mockReturnValue(of({}));
    mockToastService.showSuccessToast.mockReturnValue({} as any);
    const fileId = 'file-id';
    await service.update(fileId, {});

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.post.mock.calls[0][0]).toContain(fileId);
    expect(mockToastService.showSuccessToast).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(0);
  });

  it('should show an error toast if update fails', async () => {
    mockHttpClient.post.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );
    const fileId = 'file-id';
    await service.update(fileId, {});

    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make a post request for complete', async () => {
    mockHttpClient.post.mockReturnValue(of({}));
    mockToastService.showSuccessToast.mockReturnValue({} as any);
    const fileId = 'file-id';
    await service.complete(fileId);

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.post.mock.calls[0][0]).toContain(fileId);
    expect(mockToastService.showSuccessToast).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(0);
  });

  it('should show an error toast if complete fails', async () => {
    mockHttpClient.post.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );
    const fileId = 'file-id';
    await service.complete(fileId);

    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make a post request for return', async () => {
    mockHttpClient.post.mockReturnValue(of({}));
    mockToastService.showSuccessToast.mockReturnValue({} as any);
    const fileId = 'file-id';
    await service.returnApplication(fileId, {
      applicantComment: '',
      reasonForReturn: 'incomplete',
    });

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.post.mock.calls[0][0]).toContain(fileId);
    expect(mockToastService.showSuccessToast).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(0);
  });

  it('should show an error toast if return fails', async () => {
    mockHttpClient.post.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );
    const fileId = 'file-id';
    await service.returnApplication(fileId, {
      applicantComment: '',
      reasonForReturn: 'incomplete',
    });

    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });
});
