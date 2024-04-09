import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { ToastService } from '../toast/toast.service';
import { InquiryService } from './inquiry.service';

describe('PlanningReviewService', () => {
  let service: InquiryService;
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
    service = TestBed.inject(InquiryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call get for fetchTypes', async () => {
    httpClient.get.mockReturnValue(
      of([
        {
          code: 'CODE',
        },
      ]),
    );

    const res = await service.fetchTypes();

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res?.length).toEqual(1);
    expect(res![0].code).toEqual('CODE');
  });

  it('should show an error toast message if fetchTypes fails', async () => {
    httpClient.get.mockReturnValue(
      throwError(() => {
        new Error('');
      }),
    );

    const res = await service.fetchTypes();

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeUndefined();
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should call post for create', async () => {
    httpClient.post.mockReturnValue(
      of({
        fileNumber: '1',
      }),
    );

    await service.create({
      summary: '',
      boardCode: '',
      typeCode: '',
      submittedToAlcDate: 0,
      localGovernmentUuid: '',
      regionCode: '',
    });

    expect(httpClient.post).toHaveBeenCalledTimes(1);
  });

  it('should show an error toast message if create fails', async () => {
    httpClient.post.mockReturnValue(
      throwError(() => {
        new Error('');
      }),
    );

    const res = await service.create({
      summary: '',
      boardCode: '',
      typeCode: '',
      submittedToAlcDate: 0,
      localGovernmentUuid: '',
      regionCode: '',
    });

    expect(httpClient.post).toHaveBeenCalledTimes(1);
    expect(res).toBeUndefined();
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should fetch planning review by file number', async () => {
    httpClient.get.mockReturnValue(
      of({
        fileNumber: '1',
      }),
    );

    const res = await service.fetch('1');

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.fileNumber).toEqual('1');
  });

  it('should show an error toast message if fetch by file number fails', async () => {
    httpClient.get.mockReturnValue(
      throwError(() => {
        new Error('');
      }),
    );

    const res = await service.fetch('1');

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeUndefined();
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should fetch planning reviews by card', async () => {
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

    const res = await service.fetchByCardUuid('1');

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeUndefined();
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should call patch for update', async () => {
    httpClient.patch.mockReturnValue(
      of({
        fileNumber: '1',
      }),
    );

    const res = await service.update('1', {});

    expect(httpClient.patch).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.fileNumber).toEqual('1');
  });

  it('should show an error toast message if update fails', async () => {
    httpClient.patch.mockReturnValue(
      throwError(() => {
        new Error('');
      }),
    );

    const res = await service.update('1', {});

    expect(httpClient.patch).toHaveBeenCalledTimes(1);
    expect(res).toBeUndefined();
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });
});
