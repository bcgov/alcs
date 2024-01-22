import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of } from 'rxjs';
import { ToastService } from '../../toast/toast.service';
import { ApplicationParcelService } from './application-parcel.service';

describe('ApplicationParcelService', () => {
  let service: ApplicationParcelService;
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
    service = TestBed.inject(ApplicationParcelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should successfully fetch parcels', async () => {
    mockHttpClient.get.mockReturnValue(of([]));

    const result = await service.fetchParcels('1');

    expect(result).toEqual([]);
    expect(mockHttpClient.get).toBeCalledTimes(1);
  });
});
