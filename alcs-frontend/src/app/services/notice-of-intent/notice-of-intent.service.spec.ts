import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { ToastService } from '../toast/toast.service';

import { NoticeOfIntentService } from './notice-of-intent.service';

describe('NoticeOfIntentService', () => {
  let service: NoticeOfIntentService;
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
    service = TestBed.inject(NoticeOfIntentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make a get request for fetching subTypes', async () => {
    httpClient.get.mockReturnValue(
      of([
        {
          code: 'MAGIC',
        },
      ]),
    );

    const res = await service.listSubtypes();

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res.length).toEqual(1);
    expect(res[0].code).toEqual('MAGIC');
  });

  it('should show an error toast when listSubtypes fails', async () => {
    httpClient.get.mockReturnValue(
      throwError(() => {
        return new Error('Error');
      }),
    );

    const res = await service.listSubtypes();

    expect(res).toEqual([]);
    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should fetch by card', async () => {
    httpClient.get.mockReturnValue(
      of({
        fileNumber: '1',
      }),
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
      }),
    );

    await service.fetchByCardUuid('1');

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should fetch by file number', async () => {
    httpClient.get.mockReturnValue(
      of({
        fileNumber: '1',
      }),
    );

    const res = await service.fetchByFileNumber('1');

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.fileNumber).toEqual('1');
  });

  it('should call get for searchByFileNumber', async () => {
    httpClient.get.mockReturnValue(
      of([
        {
          fileNumber: '1',
        },
      ]),
    );

    const res = await service.searchByFileNumber('1');

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res.length).toEqual(1);
    expect(res[0].fileNumber).toEqual('1');
  });

  it('should show an error toast message if fetch by file number fails', async () => {
    httpClient.get.mockReturnValue(
      throwError(() => {
        new Error('');
      }),
    );

    await service.fetchByFileNumber('1');

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should call post for update', async () => {
    httpClient.post.mockReturnValue(
      of({
        fileNumber: '1',
      }),
    );

    await service.update('file-number', {
      summary: 'summary',
    });

    expect(httpClient.post).toHaveBeenCalledTimes(1);
  });

  it('should call post for cancel', async () => {
    httpClient.post.mockReturnValue(
      of({
        fileNumber: '1',
      }),
    );

    await service.cancel('file-number');

    expect(httpClient.post).toHaveBeenCalledTimes(1);
  });

  it('should call post for uncancel', async () => {
    httpClient.post.mockReturnValue(
      of({
        fileNumber: '1',
      }),
    );

    await service.uncancel('file-number');

    expect(httpClient.post).toHaveBeenCalledTimes(1);
  });
});
