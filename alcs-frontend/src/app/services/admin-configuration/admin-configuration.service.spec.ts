import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { ToastService } from '../toast/toast.service';
import { AdminConfigurationService, CONFIG_VALUE } from './admin-configuration.service';

describe('AdminBoardManagementService', () => {
  let service: AdminConfigurationService;
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
    service = TestBed.inject(AdminConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call get on list', async () => {
    mockHttpClient.get.mockReturnValue(of([]));

    await service.listConfigurations();

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
  });

  it('should show toast if list fails', async () => {
    mockHttpClient.get.mockReturnValue(
      throwError(() => {
        new Error('');
      }),
    );

    await service.listConfigurations();

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should call post on update', async () => {
    mockHttpClient.post.mockReturnValue(of({ success: true }));

    await service.setConfiguration(CONFIG_VALUE.PORTAL_MAINTENANCE_MODE, 'mock-value');

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
  });

  it('should show toast if update fails', async () => {
    mockHttpClient.post.mockReturnValue(
      throwError(() => {
        new Error('');
      }),
    );

    await service.setConfiguration(CONFIG_VALUE.PORTAL_MAINTENANCE_MODE, 'mock-value');

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });
});
