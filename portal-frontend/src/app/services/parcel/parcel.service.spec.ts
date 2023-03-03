import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of } from 'rxjs';
import { ToastService } from '../toast/toast.service';
import { ParcelLookupDto } from './parcel.dto';

import { ParcelService } from './parcel.service';

describe('ParcelService', () => {
  let service: ParcelService;
  let mockHttpClient: DeepMocked<HttpClient>;

  beforeEach(() => {
    mockHttpClient = createMock();

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        {
          provide: ToastService,
          useValue: {},
        },
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
      ],
    });
    service = TestBed.inject(ParcelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make a get request when looking up pid', async () => {
    const mockRes = {} as ParcelLookupDto;
    mockHttpClient.get.mockReturnValue(of(mockRes));

    const res = await service.getByPid('fake-pid');
    expect(res).toBe(mockRes);
  });

  it('should make a get request when looking up pin', async () => {
    const mockRes = {} as ParcelLookupDto;
    mockHttpClient.get.mockReturnValue(of(mockRes));

    const res = await service.getByPin('fake-pin');
    expect(res).toBe(mockRes);
  });
});
