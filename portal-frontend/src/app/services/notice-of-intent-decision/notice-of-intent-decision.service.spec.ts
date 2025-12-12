import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { ToastService } from '../toast/toast.service';
import { NoticeOfIntentDecisionService } from './notice-of-intent-decision.service';

describe('NoticeOfIntentDecisionService', () => {
  let service: NoticeOfIntentDecisionService;
  let mockToastService: DeepMocked<ToastService>;
  let mockHttpClient: DeepMocked<HttpClient>;

  beforeEach(() => {
    mockToastService = createMock();
    mockHttpClient = createMock();

    TestBed.configureTestingModule({
    imports: [],
    providers: [
        {
            provide: ToastService,
            useValue: mockToastService,
        },
        {
            provide: HttpClient,
            useValue: mockHttpClient,
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
});
    service = TestBed.inject(NoticeOfIntentDecisionService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should make a get requests for getByFileID', async () => {
    const mockResponse = {};
    mockHttpClient.get.mockReturnValue(of(mockResponse));

    const res = await service.getByFileId('fileNumber');
    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toEqual(mockResponse);
  });

  it('should show an error toast if getByFileID fails', async () => {
    mockHttpClient.get.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    await service.getByFileId('fileNumber');
    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make a get requests for openFile', async () => {
    const mockResponse = {};
    mockHttpClient.get.mockReturnValue(of(mockResponse));

    const res = await service.openFile('fileNumber');
    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toEqual(mockResponse);
  });

  it('should show an error toast if openFile fails', async () => {
    mockHttpClient.get.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    await service.openFile('documentId');
    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });
});
