import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of } from 'rxjs';
import { ToastService } from '../../toast/toast.service';

import { NoticeOfIntentParcelService } from './notice-of-intent-parcel.service';

describe('NoticeOfIntentParcelService', () => {
  let service: NoticeOfIntentParcelService;
  let mockToastService: DeepMocked<ToastService>;
  let mockHttpClient: DeepMocked<HttpClient>;

  beforeEach(() => {
    mockToastService = createMock();
    mockHttpClient = createMock();

    TestBed.configureTestingModule({
      providers: [
        { provide: ToastService, useValue: mockToastService },
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
      ],
    });
    service = TestBed.inject(NoticeOfIntentParcelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should successfully fetch parcels', async () => {
    mockHttpClient.get.mockReturnValue(of([]));

    const result = await service.fetchParcels('1');

    expect(result).toEqual([]);
    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
  });

  it('should call post for setting parcel area', async () => {
    mockHttpClient.post.mockReturnValue(of([]));

    const result = await service.setParcelArea('1', 5);

    expect(result).toEqual([]);
    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
  });
});
