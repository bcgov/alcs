import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { ToastService } from '../toast/toast.service';

import { NotificationSubmissionService } from './notification-submission.service';

describe('NotificationSubmissionService', () => {
  let service: NotificationSubmissionService;
  let mockToastService: DeepMocked<ToastService>;
  let mockHttpClient: DeepMocked<HttpClient>;

  beforeEach(() => {
    mockToastService = createMock();
    mockHttpClient = createMock();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: ToastService,
          useValue: mockToastService,
        },
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
      ],
    });
    service = TestBed.inject(NotificationSubmissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make a get request for loading notifications', async () => {
    mockHttpClient.get.mockReturnValue(of({}));

    await service.getNotifications();

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.get.mock.calls[0][0]).toContain('notification');
  });

  it('should show an error toast if getting notifications fails', async () => {
    mockHttpClient.get.mockReturnValue(throwError(() => ({})));

    await service.getNotifications();

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make a get request for loading a single notification', async () => {
    mockHttpClient.get.mockReturnValue(of({}));
    let mockFileId = 'file-id';

    await service.getByFileId(mockFileId);

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.get.mock.calls[0][0]).toContain('notification');
    expect(mockHttpClient.get.mock.calls[0][0]).toContain(mockFileId);
  });

  it('should show an error toast if getting a specific notification fails', async () => {
    mockHttpClient.get.mockReturnValue(throwError(() => ({})));

    await service.getByFileId('file-id');

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make a post request for create', async () => {
    mockHttpClient.post.mockReturnValue(of({}));

    await service.create();

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.post.mock.calls[0][0]).toContain('notification');
  });

  it('should show an error toast if creating an notification fails', async () => {
    mockHttpClient.post.mockReturnValue(throwError(() => ({})));

    await service.create();

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make a put request for update', async () => {
    mockHttpClient.put.mockReturnValue(of({}));
    let mockFileId = 'fileId';

    await service.updatePending('fileId', {});

    expect(mockHttpClient.put).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.put.mock.calls[0][0]).toContain('notification');
    expect(mockHttpClient.put.mock.calls[0][0]).toContain(mockFileId);
  });

  it('should show an error toast if updating an notification fails', async () => {
    mockHttpClient.put.mockReturnValue(throwError(() => ({})));

    await service.updatePending('file-id', {});

    expect(mockHttpClient.put).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make a post request for cancelling', async () => {
    mockHttpClient.post.mockReturnValue(of({}));

    await service.cancel('fileId');

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.post.mock.calls[0][0]).toContain('notification');
  });

  it('should show an error toast if cancelling a file fails', async () => {
    mockHttpClient.post.mockReturnValue(throwError(() => ({})));

    await service.cancel('fileId');

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });
});
