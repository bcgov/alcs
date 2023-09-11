import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { ToastService } from '../toast/toast.service';

import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
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
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch by card', async () => {
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

    await service.fetchByCardUuid('1');

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });
});
