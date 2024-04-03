import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { ToastService } from '../toast/toast.service';
import { ApplicationDecisionService } from './application-decision.service';

describe('ApplicationDecisionService', () => {
  let service: ApplicationDecisionService;
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
    service = TestBed.inject(ApplicationDecisionService);
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
