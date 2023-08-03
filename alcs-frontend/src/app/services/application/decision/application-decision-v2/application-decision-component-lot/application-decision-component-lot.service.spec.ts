import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { ToastService } from '../../../../toast/toast.service';

import { ApplicationDecisionComponentLotService } from './application-decision-component-lot.service';

describe('ApplicationDecisionComponentLotService', () => {
  let service: ApplicationDecisionComponentLotService;
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
    service = TestBed.inject(ApplicationDecisionComponentLotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make an http patch and show a success toast when updating', async () => {
    const fakeUuid = 'uuid';

    httpClient.patch.mockReturnValue(of({ uuid: fakeUuid }));

    await service.update(fakeUuid, {
      uuid: fakeUuid,
      planNumbers: null,
      index: 0,
      componentUuid: '',
      type: null,
      size: null,
    });

    expect(httpClient.patch).toHaveBeenCalledTimes(1);
    expect(toastService.showSuccessToast).toHaveBeenCalledTimes(1);
  });

  it('should show a toast message if update fails', async () => {
    const fakeUuid = 'uuid';

    httpClient.patch.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    try {
      await service.update(fakeUuid, {
        uuid: fakeUuid,
        planNumbers: null,
        index: 0,
        componentUuid: '',
        type: null,
        size: null,
      });
    } catch (e) {
      //OM NOM NOM
    }

    expect(httpClient.patch).toHaveBeenCalledTimes(1);
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });
});
