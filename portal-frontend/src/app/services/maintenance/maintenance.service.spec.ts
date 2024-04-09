import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of } from 'rxjs';
import { MaintenanceService } from './maintenance.service';

describe('MaintenanceService', () => {
  let service: MaintenanceService;
  let mockHttpClient: DeepMocked<HttpClient>;

  beforeEach(() => {
    mockHttpClient = createMock();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
      ],
    });
    service = TestBed.inject(MaintenanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call get for the health endpoint', async () => {
    mockHttpClient.get.mockReturnValue(of({}));

    const res = await service.check();

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
  });

  it('should make a get request for getBanner', async () => {
    mockHttpClient.get.mockReturnValue(of({}));

    const res = await service.getBanner();
    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
  });
});
