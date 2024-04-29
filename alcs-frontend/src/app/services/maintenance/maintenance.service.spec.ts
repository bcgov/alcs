import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
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

  it('should make a get request for getBanner', async () => {
    mockHttpClient.get.mockReturnValue(of({}));

    const res = await service.getBanner();
    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
  });

  it('should set show banner', () => {
    service.setShowBanner(true);
    expect(service.$showBanner.value).toEqual(true);
  });

  it('should set banner message', () => {
    const mockMessage = 'Test Message';
    service.setBannerMessage(mockMessage);
    expect(service.$bannerMessage.value).toEqual(mockMessage);
  });
});
