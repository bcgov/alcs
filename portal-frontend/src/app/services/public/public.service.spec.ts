import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { ToastService } from '../toast/toast.service';
import { PublicService } from './public.service';

describe('PublicService', () => {
  let service: PublicService;
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
    service = TestBed.inject(PublicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call get for loading applications', async () => {
    mockHttpClient.get.mockReturnValue(of({}));

    const res = await service.getApplication('fileId');

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
  });

  it('should show an error toast if getApplication fails', async () => {
    mockHttpClient.get.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    await service.getApplication('fileId');
    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should call get for opening application files', async () => {
    mockHttpClient.get.mockReturnValue(of({}));

    const res = await service.getApplicationOpenFileUrl('fileId', 'documentUuid');

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
  });

  it('should show an error toast if getApplicationOpenFileUrl fails', async () => {
    mockHttpClient.get.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    await service.getApplicationOpenFileUrl('fileId', 'documentUuid');
    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should call get for download application files', async () => {
    mockHttpClient.get.mockReturnValue(of({}));

    const res = await service.getApplicationDownloadFileUrl('fileId', 'documentUuid');

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
  });

  it('should show an error toast if getApplicationDownloadFileUrl fails', async () => {
    mockHttpClient.get.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    await service.getApplicationDownloadFileUrl('fileId', 'documentUuid');
    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should call get for loading Notice of Intent', async () => {
    mockHttpClient.get.mockReturnValue(of({}));

    const res = await service.getNoticeOfIntent('fileId');

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
  });

  it('should show an error toast if getNoticeOfIntent fails', async () => {
    mockHttpClient.get.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    await service.getNoticeOfIntent('fileId');
    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should call get for opening Notice of Intent files', async () => {
    mockHttpClient.get.mockReturnValue(of({}));

    const res = await service.getNoticeOfIntentOpenFileUrl('fileId', 'documentUuid');

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
  });

  it('should show an error toast if getNoticeOfIntentOpenFileUrl fails', async () => {
    mockHttpClient.get.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    await service.getNoticeOfIntentOpenFileUrl('fileId', 'documentUuid');
    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should call get for download Notice of Intent files', async () => {
    mockHttpClient.get.mockReturnValue(of({}));

    const res = await service.getNoticeOfIntentDownloadFileUrl('fileId', 'documentUuid');

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
  });

  it('should show an error toast if getNoticeOfIntentDownloadFileUrl fails', async () => {
    mockHttpClient.get.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    await service.getNoticeOfIntentDownloadFileUrl('fileId', 'documentUuid');
    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should call get for loading Notification', async () => {
    mockHttpClient.get.mockReturnValue(of({}));

    const res = await service.getNotification('fileId');

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
  });

  it('should show an error toast if getNotification fails', async () => {
    mockHttpClient.get.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    await service.getNotification('fileId');
    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should call get for opening Notification files', async () => {
    mockHttpClient.get.mockReturnValue(of({}));

    const res = await service.getNotificationOpenFileUrl('fileId', 'documentUuid');

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
  });

  it('should show an error toast if getNotificationOpenFileUrl fails', async () => {
    mockHttpClient.get.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    await service.getNotificationOpenFileUrl('fileId', 'documentUuid');
    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should call get for download Notification files', async () => {
    mockHttpClient.get.mockReturnValue(of({}));

    const res = await service.getNotificationDownloadFileUrl('fileId', 'documentUuid');

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
  });

  it('should show an error toast if getNotificationDownloadFileUrl fails', async () => {
    mockHttpClient.get.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    await service.getNotificationDownloadFileUrl('fileId', 'documentUuid');
    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });
});
