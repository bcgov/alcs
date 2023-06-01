import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { firstValueFrom, of, throwError } from 'rxjs';
import { ToastService } from '../../toast/toast.service';
import { NoticeOfIntentMeetingService } from './notice-of-intent-meeting.service';

describe('NoticeOfIntentMeetingService', () => {
  let service: NoticeOfIntentMeetingService;
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
    service = TestBed.inject(NoticeOfIntentMeetingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch meetings by noi', async () => {
    httpClient.get.mockReturnValue(
      of([
        {
          uuid: '1',
        },
      ])
    );

    await service.fetch('1');
    const res = await firstValueFrom(service.$meetings);

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res.length).toEqual(1);
    expect(res[0].uuid).toEqual('1');
  });

  it('should show an error toast message if fetch by noi fails', async () => {
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
    httpClient.patch.mockReturnValue(
      of([
        {
          uuid: '1',
        },
      ])
    );

    await service.update('1', 'type', {});

    expect(httpClient.patch).toHaveBeenCalledTimes(1);
    expect(toastService.showSuccessToast).toHaveBeenCalledTimes(1);
  });

  it('should show an error toast message if update fails', async () => {
    httpClient.patch.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    await service.update('1', 'type', {});

    expect(httpClient.patch).toHaveBeenCalledTimes(1);
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should create meetings', async () => {
    httpClient.post.mockReturnValue(
      of([
        {
          uuid: '1',
        },
      ])
    );

    await service.create('1', 'type', { meetingStartDate: new Date(5000), meetingTypeCode: '' });

    expect(httpClient.post).toHaveBeenCalledTimes(1);
    expect(toastService.showSuccessToast).toHaveBeenCalledTimes(1);
  });

  it('should show an error toast message if create fails', async () => {
    httpClient.post.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    await service.create('1', 'type', { meetingStartDate: new Date(5000), meetingTypeCode: '' });

    expect(httpClient.post).toHaveBeenCalledTimes(1);
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should fetch a single meeting', async () => {
    httpClient.get.mockReturnValue(
      of({
        uuid: '1',
      })
    );

    const res = await service.fetchOne('1');

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.uuid).toEqual('1');
  });

  it('should delete meetings', async () => {
    httpClient.delete.mockReturnValue(
      of([
        {
          uuid: '1',
        },
      ])
    );

    await service.delete('1', 'type');

    expect(httpClient.delete).toHaveBeenCalledTimes(1);
    expect(toastService.showSuccessToast).toHaveBeenCalledTimes(1);
  });

  it('should show an error toast message if delete fails', async () => {
    httpClient.delete.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    await service.delete('1', 'type');

    expect(httpClient.delete).toHaveBeenCalledTimes(1);
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });
});
