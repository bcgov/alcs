import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { ToastService } from '../../../../toast/toast.service';

import { ApplicationDecisionComponentToConditionLotService } from './application-decision-component-to-condition-lot.service';

describe('ApplicationDecisionComponentToConditionLotService', () => {
  let service: ApplicationDecisionComponentToConditionLotService;
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
    service = TestBed.inject(ApplicationDecisionComponentToConditionLotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch and return an condition lots', async () => {
    const fakeConditionUuid = 'con_uuid';
    const fakeComponentUuid = 'com_uuid';

    httpClient.get.mockReturnValue(
      of([
        {
          componentLotUuid: fakeComponentUuid,
          conditionUuid: fakeConditionUuid,
        },
      ])
    );

    const res = await service.fetchConditionLots(fakeConditionUuid, fakeComponentUuid);

    expect(res.length).toEqual(1);
    expect(res[0].componentLotUuid).toEqual(fakeComponentUuid);
    expect(res[0].conditionUuid).toEqual(fakeConditionUuid);
  });

  it('should show a toast message if fetch fails', async () => {
    httpClient.get.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );
    let res = [];

    try {
      res = await service.fetchConditionLots('1', '2');
    } catch (e) {
      //OM NOM NOM
    }

    expect(res.length).toEqual(0);
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make an http patch and show a success toast when updating', async () => {
    const fakeConditionUuid = 'con_uuid';
    const fakeComponentUuid = 'com_uuid';

    httpClient.patch.mockReturnValue(
      of({
        componentLotUuid: fakeComponentUuid,
        conditionUuid: fakeConditionUuid,
      })
    );

    await service.update(fakeComponentUuid, fakeConditionUuid, 'fake');

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
      await service.update('1', '2', 'fake');
    } catch (e) {
      //OM NOM NOM
    }

    expect(httpClient.patch).toHaveBeenCalledTimes(1);
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });
});
