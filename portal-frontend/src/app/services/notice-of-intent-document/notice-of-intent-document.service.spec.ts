import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { ToastService } from '../toast/toast.service';
import { NoticeOfIntentDocumentService } from './notice-of-intent-document.service';

describe('NoticeOfIntentDocumentService', () => {
  let service: NoticeOfIntentDocumentService;
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
    service = TestBed.inject(NoticeOfIntentDocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make a get request for open file', async () => {
    mockHttpClient.get.mockReturnValue(of({}));

    await service.openFile('fileId');

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.get.mock.calls[0][0]).toContain('notice-of-intent-document');
  });

  it('should show an error toast if opening a file fails', async () => {
    mockHttpClient.get.mockReturnValue(throwError(() => ({})));

    await service.openFile('fileId');

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make a delete request for delete file', async () => {
    mockHttpClient.delete.mockReturnValue(of({}));

    await service.deleteExternalFile('fileId');

    expect(mockHttpClient.delete).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.delete.mock.calls[0][0]).toContain('notice-of-intent-document');
  });

  it('should show an error toast if deleting a file fails', async () => {
    mockHttpClient.delete.mockReturnValue(throwError(() => ({})));

    await service.deleteExternalFile('fileId');

    expect(mockHttpClient.delete).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make a patch request for update file', async () => {
    mockHttpClient.patch.mockReturnValue(of({}));

    await service.update('fileId', []);

    expect(mockHttpClient.patch).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.patch.mock.calls[0][0]).toContain('notice-of-intent-document');
  });

  it('should show an error toast if updating a file fails', async () => {
    mockHttpClient.patch.mockReturnValue(throwError(() => ({})));

    await service.update('fileId', []);

    expect(mockHttpClient.patch).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });
});
