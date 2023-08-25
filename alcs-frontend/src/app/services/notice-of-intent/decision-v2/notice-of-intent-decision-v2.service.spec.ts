import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../toast/toast.service';
import { NoticeOfIntentDecisionV2Service } from './notice-of-intent-decision-v2.service';

describe('NoticeOfIntentDecisionV2Service', () => {
  let service: NoticeOfIntentDecisionV2Service;
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
    service = TestBed.inject(NoticeOfIntentDecisionV2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch and return an noiDto', async () => {
    httpClient.get.mockReturnValue(
      of([
        {
          fileNumber: '1',
        },
      ])
    );

    const res = await service.fetchByFileNumber('1');

    expect(res.length).toEqual(1);
    expect(res[0].fileNumber).toEqual('1');
  });

  it('should show a toast message if fetch fails', async () => {
    httpClient.get.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    const res = await service.fetchByFileNumber('1');

    expect(res.length).toEqual(0);
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make an http patch and show a success toast when updating', async () => {
    httpClient.patch.mockReturnValue(
      of({
        fileNumber: '1',
      })
    );

    await service.update('1', {
      isDraft: false,
    });

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
      await service.update('1', {
        isDraft: false,
      });
    } catch (e) {
      //OM NOM NOM
    }

    expect(httpClient.patch).toHaveBeenCalledTimes(1);
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make an http post and show a success toast when creating', async () => {
    httpClient.post.mockReturnValue(
      of({
        fileNumber: '1',
      })
    );

    await service.create({
      fileNumber: '',
      date: 0,
      modifiesUuid: '',
      outcomeCode: '',
      resolutionNumber: 0,
      resolutionYear: 0,
      isDraft: true,
    });

    expect(httpClient.post).toHaveBeenCalledTimes(1);
    expect(toastService.showSuccessToast).toHaveBeenCalledTimes(1);
  });

  it('should show a toast message if create fails', async () => {
    httpClient.post.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    try {
      await service.create({
        fileNumber: '',
        date: 0,
        modifiesUuid: '',
        outcomeCode: '',
        resolutionNumber: 0,
        resolutionYear: 0,
        isDraft: true,
      });
    } catch (e) {
      //OM NOM NOM
    }

    expect(httpClient.post).toHaveBeenCalledTimes(1);
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should make an http delete and show a success toast', async () => {
    httpClient.delete.mockReturnValue(
      of({
        fileNumber: '1',
      })
    );

    await service.delete('');

    expect(httpClient.delete).toHaveBeenCalledTimes(1);
    expect(toastService.showSuccessToast).toHaveBeenCalledTimes(1);
  });

  it('should show a toast message if delete fails', async () => {
    httpClient.delete.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    try {
      await service.delete('');
    } catch (e) {
      //OM NOM NOM
    }

    expect(httpClient.delete).toHaveBeenCalledTimes(1);
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should show a toast warning when uploading a file thats too large', async () => {
    const file = createMock<File>();
    Object.defineProperty(file, 'size', { value: environment.maxFileSize + 1 });

    await service.uploadFile('', file);

    expect(toastService.showWarningToast).toHaveBeenCalledTimes(1);
    expect(httpClient.post).toHaveBeenCalledTimes(0);
  });

  it('should make an http patch call for update file', async () => {
    httpClient.patch.mockReturnValue(
      of([
        {
          fileNumber: '1',
        },
      ])
    );
    await service.updateFile('', '', '');

    expect(httpClient.patch).toHaveBeenCalledTimes(1);
  });

  it('should make an http delete when deleting a file', async () => {
    httpClient.delete.mockReturnValue(
      of({
        fileNumber: '1',
      })
    );

    await service.deleteFile('', '');

    expect(httpClient.delete).toHaveBeenCalledTimes(1);
  });

  it('should make an http get when requesting a new resolution number', async () => {
    httpClient.get.mockReturnValue(of(1));

    await service.getNextAvailableResolutionNumber(2023);

    expect(httpClient.get).toHaveBeenCalledTimes(1);
  });
});
