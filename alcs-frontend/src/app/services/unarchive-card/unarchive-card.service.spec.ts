import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { ToastService } from '../toast/toast.service';
import { UnarchiveCardService } from './unarchive-card.service';

describe('UnarchiveCardService', () => {
  let service: UnarchiveCardService;
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
    service = TestBed.inject(UnarchiveCardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call post on search', async () => {
    mockHttpClient.get.mockReturnValue(of([]));

    const res = await service.search('filenumber');

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
  });

  it('should show toast if search fails', async () => {
    mockHttpClient.get.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    const res = await service.search('filenumber');

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toEqual([]);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should call patch on unarchive', async () => {
    mockHttpClient.patch.mockReturnValue(
      of({
        restored: true,
      })
    );

    const res = await service.unarchiveCard('uuid');

    expect(mockHttpClient.patch).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.restored).toEqual(true);
  });

  it('should show toast if unarchive fails', async () => {
    mockHttpClient.patch.mockReturnValue(
      throwError(() => {
        new Error('');
      })
    );

    const res = await service.unarchiveCard('mock');

    expect(mockHttpClient.patch).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });
});
