import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { ToastService } from '../toast/toast.service';
import { NoticeOfIntentSubmissionDraftService } from './notice-of-intent-submission-draft.service';

describe('ApplicationSubmissionDraftService', () => {
  let service: NoticeOfIntentSubmissionDraftService;
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
    service = TestBed.inject(NoticeOfIntentSubmissionDraftService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make a get request for loading a single notice of intent', async () => {
    mockHttpClient.get.mockReturnValue(of({}));
    let mockFileId = 'file-id';

    await service.getByFileId(mockFileId);

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.get.mock.calls[0][0]).toContain('notice-of-intent');
    expect(mockHttpClient.get.mock.calls[0][0]).toContain(mockFileId);
  });

  it('should show an error toast if getting a specific notice of intent fails', async () => {
    mockHttpClient.get.mockReturnValue(throwError(() => ({})));

    await service.getByFileId('file-id');

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make a put request for update', async () => {
    mockHttpClient.put.mockReturnValue(of({}));
    let mockFileId = 'fileId';

    await service.updatePending('fileId', {});

    expect(mockHttpClient.put).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.put.mock.calls[0][0]).toContain('notice-of-intent');
    expect(mockHttpClient.put.mock.calls[0][0]).toContain(mockFileId);
  });

  it('should show an error toast if updating an notice of intent fails', async () => {
    mockHttpClient.put.mockReturnValue(throwError(() => ({})));

    await service.updatePending('file-id', {});

    expect(mockHttpClient.put).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make a delete request for delete', async () => {
    mockHttpClient.delete.mockReturnValue(of({}));

    await service.delete('fileId');

    expect(mockHttpClient.delete).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.delete.mock.calls[0][0]).toContain('notice-of-intent');
  });

  it('should show an error toast if delete a draft fails', async () => {
    mockHttpClient.delete.mockReturnValue(throwError(() => ({})));

    await service.delete('fileId');

    expect(mockHttpClient.delete).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });
});
