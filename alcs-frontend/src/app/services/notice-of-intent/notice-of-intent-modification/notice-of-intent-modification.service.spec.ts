import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { firstValueFrom, of, throwError } from 'rxjs';
import { ToastService } from '../../toast/toast.service';

import { NoticeOfIntentModificationService } from './notice-of-intent-modification.service';

describe('NoticeOfIntentModificationService', () => {
  let service: NoticeOfIntentModificationService;
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
    service = TestBed.inject(NoticeOfIntentModificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be fetch modifications and sort them by submittedDate', async () => {
    httpClient.get.mockReturnValue(
      of([
        {
          uuid: '3',
          submittedDate: new Date(5000),
        },
        {
          uuid: '1',
          submittedDate: new Date(3000),
        },
        {
          uuid: '2',
          submittedDate: new Date(4000),
        },
      ])
    );

    await service.fetchByFileNumber('1');
    const res = await firstValueFrom(service.$modifications);

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res.length).toEqual(3);
    expect(res[0].uuid).toEqual('3');
    expect(res[1].uuid).toEqual('2');
    expect(res[2].uuid).toEqual('1');
  });

  it('should show an error toast message if fetch fails', async () => {
    httpClient.get.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    await service.fetchByFileNumber('1');
    const res = await firstValueFrom(service.$modifications);

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res.length).toEqual(0);
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should fetch modifications by card', async () => {
    httpClient.get.mockReturnValue(
      of({
        uuid: '1',
        submittedDate: new Date(3000),
      })
    );

    const res = await service.fetchByCardUuid('1');

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.uuid).toEqual('1');
  });

  it('should show an error toast message if fetch by card fails', async () => {
    httpClient.get.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    const res = await service.fetchByCardUuid('1');

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeUndefined();
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should call patch for update', async () => {
    httpClient.patch.mockReturnValue(
      of({
        uuid: '1',
        submittedDate: new Date(3000),
      })
    );

    const res = await service.update('1', {});

    expect(httpClient.patch).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.uuid).toEqual('1');
  });

  it('should show an error toast message if update fails', async () => {
    httpClient.patch.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    const res = await service.update('1', {});

    expect(httpClient.patch).toHaveBeenCalledTimes(1);
    expect(res).toBeUndefined();
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should call post for create', async () => {
    httpClient.post.mockReturnValue(
      of({
        uuid: '1',
        submittedDate: new Date(3000),
      })
    );

    const res = await service.create({
      fileNumber: '',
      boardCode: '',
      localGovernmentUuid: '',
      modifiesDecisionUuids: [],
      regionCode: '',
      submittedDate: 0,
      applicant: '',
    });

    expect(httpClient.post).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.uuid).toEqual('1');
  });

  it('should show an error toast message if create fails', async () => {
    httpClient.post.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    const res = await service.create({
      fileNumber: '',
      boardCode: '',
      localGovernmentUuid: '',
      modifiesDecisionUuids: [],
      regionCode: '',
      submittedDate: 0,
      applicant: '',
    });

    expect(httpClient.post).toHaveBeenCalledTimes(1);
    expect(res).toBeUndefined();
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should call delete for delete', async () => {
    httpClient.delete.mockReturnValue(
      of({
        uuid: '1',
        submittedDate: new Date(3000),
      })
    );

    await service.delete('');

    expect(httpClient.delete).toHaveBeenCalledTimes(1);
  });

  it('should show an error toast message if delete fails', async () => {
    httpClient.delete.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    await service.delete('');

    expect(httpClient.delete).toHaveBeenCalledTimes(1);
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });
});
