import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { ToastService } from '../../../toast/toast.service';

import { NoticeOfIntentDecisionConditionService } from './notice-of-intent-decision-condition.service';

describe('NoticeOfIntentDecisionConditionService', () => {
  let service: NoticeOfIntentDecisionConditionService;
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
    service = TestBed.inject(NoticeOfIntentDecisionConditionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make an http patch and show a success toast when updating', async () => {
    mockHttpClient.patch.mockReturnValue(
      of({
        fileNumber: '1',
      })
    );

    await service.update('1', {});

    expect(mockHttpClient.patch).toHaveBeenCalledTimes(1);
    expect(mockToastService.showSuccessToast).toHaveBeenCalledTimes(1);
  });

  it('should show a toast message if update fails', async () => {
    mockHttpClient.patch.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    try {
      await service.update('1', {});
    } catch (e) {
      //OM NOM NOM
    }

    expect(mockHttpClient.patch).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });
});
