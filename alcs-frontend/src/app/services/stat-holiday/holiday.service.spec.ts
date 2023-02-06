import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { ToastService } from '../toast/toast.service';
import { HolidayService } from './holiday.service';

describe('HolidayService', () => {
  let service: HolidayService;
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
    service = TestBed.inject(HolidayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call post on create', async () => {
    mockHttpClient.post.mockReturnValue(
      of({
        uuid: 'fake',
      })
    );

    const res = await service.create({
      name: 'mock',
      day: 1,
    });

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.uuid).toEqual('fake');
  });

  it('should show toast if create fails', async () => {
    mockHttpClient.post.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    const res = await service.create({
      name: 'fake',
      day: 1,
    });

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(res).toBeUndefined();
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should call put on update', async () => {
    mockHttpClient.put.mockReturnValue(
      of({
        uuid: 'fake',
      })
    );

    const res = await service.update('fake', {
      name: 'mock',
      day: 1,
    });

    expect(mockHttpClient.put).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.uuid).toEqual('fake');
  });

  it('should show toast if update fails', async () => {
    mockHttpClient.put.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    const res = await service.update('mock', {
      name: 'fake',
      day: 1,
    });

    expect(mockHttpClient.put).toHaveBeenCalledTimes(1);
    expect(res).toBeUndefined();
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should call get on fetch', async () => {
    mockHttpClient.get.mockReturnValue(
      of({
        data: [
          {
            uuid: 'fake',
          },
        ],
        total: 1,
      })
    );

    const res = await service.fetch(0, 1, undefined);

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
  });

  it('should show toast if get fails', async () => {
    mockHttpClient.get.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    const res = await service.fetch(1, 0);

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeUndefined();
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should call delete on delete', async () => {
    mockHttpClient.delete.mockReturnValue(
      of({
        uuid: 'fake',
      })
    );

    const res = await service.delete('fake');

    expect(mockHttpClient.delete).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.uuid).toEqual('fake');
  });

  it('should show toast if delete fails', async () => {
    mockHttpClient.delete.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    const res = await service.delete('mock');

    expect(mockHttpClient.delete).toHaveBeenCalledTimes(1);
    expect(res).toBeUndefined();
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });
});
