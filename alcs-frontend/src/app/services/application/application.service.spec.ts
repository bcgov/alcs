import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { firstValueFrom, of, throwError } from 'rxjs';
import { ToastService } from '../toast/toast.service';
import { ApplicationDto } from './application.dto';

import { ApplicationService } from './application.service';

describe('ApplicationService', () => {
  let service: ApplicationService;
  let httpClient: DeepMocked<HttpClient>;
  let toastService: DeepMocked<ToastService>;

  const mockApplication: ApplicationDto = {
    activeDays: 0,
    applicant: '',
    dateSubmittedToAlc: 0,
    decisionMeetings: [],
    fileNumber: '1',
    localGovernment: {
      uuid: '',
      name: '',
      preferredRegionCode: '',
    },
    paused: false,
    pausedDays: 0,
    region: {
      code: '',
      description: '',
      label: '',
    },
    type: {
      code: '',
      description: '',
      label: '',
      shortLabel: '',
      backgroundColor: '',
      textColor: '',
    },
  };

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
    service = TestBed.inject(ApplicationService);

    httpClient.get.mockReturnValueOnce(
      of({
        status: [
          {
            code: 'status',
          },
        ],
        type: [
          {
            code: 'type',
          },
        ],
        region: [
          {
            code: 'region',
          },
        ],
      })
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be fetch codes on the first api call', async () => {
    httpClient.get.mockReturnValueOnce(of({}));

    await service.fetchApplication('1');

    const cardStatuses = await firstValueFrom(service.$cardStatuses);
    const applicationTypes = await firstValueFrom(service.$applicationTypes);
    const applicationRegions = await firstValueFrom(service.$applicationRegions);

    expect(cardStatuses.length).toEqual(1);
    expect(cardStatuses[0].code).toEqual('status');

    expect(applicationTypes.length).toEqual(1);
    expect(applicationTypes[0].code).toEqual('type');

    expect(applicationRegions.length).toEqual(1);
    expect(applicationRegions[0].code).toEqual('region');
  });

  it('should fetch an application', async () => {
    httpClient.get.mockReturnValueOnce(of(mockApplication));

    const res = await service.fetchApplication('1');

    expect(httpClient.get).toHaveBeenCalledTimes(2);
    expect(res).toBeDefined();
    expect(res.fileNumber).toEqual(mockApplication.fileNumber);
  });

  it('should create an application', async () => {
    httpClient.post.mockReturnValueOnce(of(mockApplication));

    const res = await service.createApplication({
      applicant: '',
      dateSubmittedToAlc: 0,
      fileNumber: '',
      typeCode: '',
    });

    expect(httpClient.post).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res.fileNumber).toEqual(mockApplication.fileNumber);
  });

  it('should show an error toast if creating an application fails', async () => {
    httpClient.post.mockReturnValueOnce(
      throwError(() => {
        new Error('');
      })
    );

    try {
      await service.createApplication({
        applicant: '',
        dateSubmittedToAlc: 0,
        fileNumber: '',
        typeCode: '',
      });
    } catch (e) {
      //OM NOM NOM
    }

    expect(httpClient.post).toHaveBeenCalledTimes(1);
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should update an application', async () => {
    httpClient.patch.mockReturnValueOnce(of(mockApplication));

    const res = await service.updateApplication('1', {});

    expect(httpClient.patch).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.fileNumber).toEqual(mockApplication.fileNumber);
  });

  it('should show an error toast if updating an application fails', async () => {
    httpClient.patch.mockReturnValueOnce(
      throwError(() => {
        new Error('');
      })
    );

    try {
      await service.updateApplication('1', {});
    } catch (e) {
      //OM NOM NOM
    }

    expect(httpClient.patch).toHaveBeenCalledTimes(1);
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should update an application card', async () => {
    httpClient.patch.mockReturnValueOnce(of(mockApplication));

    const res = await service.updateApplicationCard('1', {});

    expect(httpClient.patch).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.fileNumber).toEqual(mockApplication.fileNumber);
  });

  it('should show an error toast if updating an application card fails', async () => {
    httpClient.patch.mockReturnValueOnce(
      throwError(() => {
        new Error('');
      })
    );

    const res = await service.updateApplicationCard('1', {});

    expect(res).toBeUndefined();
    expect(httpClient.patch).toHaveBeenCalledTimes(1);
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should search for applications', async () => {
    httpClient.get.mockReset();
    httpClient.get.mockReturnValue(of([mockApplication]));

    const res = await service.searchApplicationsByNumber('1');

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res.length).toEqual(1);
    expect(res[0].fileNumber).toEqual(mockApplication.fileNumber);
  });

  it('should fetch application by card uuid', async () => {
    httpClient.get.mockReset();
    httpClient.get.mockReturnValue(of(mockApplication));

    const res = await service.fetchByCardUuid('1');

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res.fileNumber).toEqual(mockApplication.fileNumber);
  });
});
