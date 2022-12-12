import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { firstValueFrom, of, throwError } from 'rxjs';
import { ToastService } from '../../toast/toast.service';

import { ApplicationDecisionMeetingService } from './application-decision-meeting.service';

describe('ApplicationDecisionMeetingService', () => {
  let service: ApplicationDecisionMeetingService;
  let httpClient: DeepMocked<HttpClient>;
  let toastService: DeepMocked<ToastService>;

  const mockDto = {
    uuid: '1',
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
    service = TestBed.inject(ApplicationDecisionMeetingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch decision meetings by application', async () => {
    httpClient.get.mockReturnValue(of([mockDto]));

    await service.fetch('1');
    const res = await firstValueFrom(service.$decisionMeetings);

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res.length).toEqual(1);
    expect(res[0].uuid).toEqual('1');
  });

  it('should show an error toast message if fetch by application fails', async () => {
    httpClient.get.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    await service.fetch('1');

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should update meetings', async () => {
    httpClient.patch.mockReturnValue(of(mockDto));
    httpClient.get.mockReturnValue(of([mockDto]));

    await service.update({ applicationFileNumber: '', date: new Date(), uuid: '1' });
    const res = await firstValueFrom(service.$decisionMeetings);

    expect(httpClient.patch).toHaveBeenCalledTimes(1);
    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res.length).toEqual(1);
  });

  it('should show an error toast message if update fails', async () => {
    httpClient.patch.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    await service.update({ applicationFileNumber: '', date: new Date(), uuid: '1' });

    expect(httpClient.patch).toHaveBeenCalledTimes(1);
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should create meetings', async () => {
    httpClient.post.mockReturnValue(of(mockDto));
    httpClient.get.mockReturnValue(of([mockDto]));

    await service.create({ applicationFileNumber: '', date: new Date() });
    const res = await firstValueFrom(service.$decisionMeetings);

    expect(httpClient.post).toHaveBeenCalledTimes(1);
    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res.length).toEqual(1);
  });

  it('should show an error toast message if create fails', async () => {
    httpClient.post.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    await service.create({ applicationFileNumber: '', date: new Date() });

    expect(httpClient.post).toHaveBeenCalledTimes(1);
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should fetch a single decision meeting', async () => {
    httpClient.get.mockReturnValue(of(mockDto));

    const res = await service.fetchOne('1');

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.uuid).toEqual('1');
  });

  it('should delete decision meetings', async () => {
    httpClient.delete.mockReturnValue(
      of([
        {
          uuid: '1',
        },
      ])
    );

    await service.delete('1');

    expect(httpClient.delete).toHaveBeenCalledTimes(1);
    expect(toastService.showSuccessToast).toHaveBeenCalledTimes(1);
  });

  it('should show an error toast message if delete fails', async () => {
    httpClient.delete.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    await service.delete('1');

    expect(httpClient.delete).toHaveBeenCalledTimes(1);
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });
});
