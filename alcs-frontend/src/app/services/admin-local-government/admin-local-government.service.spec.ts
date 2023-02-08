import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { ToastService } from '../toast/toast.service';
import { AdminLocalGovernmentService } from './admin-local-government.service';

describe('HolidayService', () => {
  let service: AdminLocalGovernmentService;
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
    service = TestBed.inject(AdminLocalGovernmentService);
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

    await service.create({
      name: 'mock',
      isFirstNation: false,
      bceidBusinessGuid: null,
    });

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
  });

  it('should show toast if create fails', async () => {
    mockHttpClient.post.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    await service.create({
      name: 'mock',
      isFirstNation: false,
      bceidBusinessGuid: null,
    });

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should call put on update', async () => {
    mockHttpClient.put.mockReturnValue(
      of({
        uuid: 'fake',
      })
    );

    await service.update('fake', {
      name: 'mock',
      isFirstNation: false,
      bceidBusinessGuid: null,
    });

    expect(mockHttpClient.put).toHaveBeenCalledTimes(1);
  });

  it('should show toast if update fails', async () => {
    mockHttpClient.put.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    await service.update('mock', {
      name: 'mock',
      isFirstNation: false,
      bceidBusinessGuid: null,
    });

    expect(mockHttpClient.put).toHaveBeenCalledTimes(1);
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

    await service.fetch(0, 1, undefined);

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
});
