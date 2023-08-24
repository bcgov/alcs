import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { ToastService } from '../../../toast/toast.service';

import { NoticeOfIntentDecisionComponentService } from './notice-of-intent-decision-component.service';

describe('NoticeOfIntentDecisionComponentService', () => {
  let service: NoticeOfIntentDecisionComponentService;
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
    service = TestBed.inject(NoticeOfIntentDecisionComponentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make an http patch and show a success toast when updating', async () => {
    httpClient.patch.mockReturnValue(
      of({
        fileNumber: '1',
      })
    );

    await service.update('1', { noticeOfIntentDecisionComponentTypeCode: 'fake' });

    expect(httpClient.patch).toHaveBeenCalledTimes(1);
    expect(toastService.showSuccessToast).toHaveBeenCalledTimes(1);
  });

  it('should show a toast message if update fails', async () => {
    httpClient.patch.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    try {
      await service.update('1', { noticeOfIntentDecisionComponentTypeCode: 'fake' });
    } catch (e) {
      //OM NOM NOM
    }

    expect(httpClient.patch).toHaveBeenCalledTimes(1);
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });
});
