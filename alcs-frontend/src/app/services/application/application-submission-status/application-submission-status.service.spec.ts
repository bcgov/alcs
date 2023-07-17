import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { ToastService } from '../../toast/toast.service';
import { ApplicationSubmissionStatusService } from './application-submission-status.service';

describe('ApplicationSubmissionStatusService', () => {
  let service: ApplicationSubmissionStatusService;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(() => {
    mockToastService = createMock();
    mockHttpClient = createMock();

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
    service = TestBed.inject(ApplicationSubmissionStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch statuses by fileNumber', async () => {
    mockHttpClient.get.mockReturnValue(
      of([
        {
          submissionUuid: 'fake',
        },
      ])
    );

    const res = await service.fetchSubmissionStatusesByFileNumber('1');

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(res.length).toEqual(1);
    expect(res[0].submissionUuid).toEqual('fake');
  });

  it('should show a toast message if fetch statuses by fileNumber fails', async () => {
    mockHttpClient.get.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    try {
      await service.fetchSubmissionStatusesByFileNumber('1');
    } catch {
      // suppress error message
    }

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });
});
