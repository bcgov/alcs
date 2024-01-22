import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { firstValueFrom, of } from 'rxjs';
import { ToastService } from '../toast/toast.service';
import { ApplicationDetailService } from './application-detail.service';
import { ApplicationDto } from './application.dto';
import { ApplicationService } from './application.service';

describe('ApplicationDetailService', () => {
  let service: ApplicationDetailService;
  let applicationService: DeepMocked<ApplicationService>;

  beforeEach(() => {
    applicationService = createMock();

    TestBed.configureTestingModule({
      providers: [
        ApplicationDetailService,
        {
          provide: ApplicationService,
          useValue: applicationService,
        },
      ],
    });
    service = TestBed.inject(ApplicationDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should publish the loaded application', async () => {
    applicationService.fetchApplication.mockResolvedValue({
      fileNumber: '1',
    } as ApplicationDto);

    await service.loadApplication('1');
    const res = await firstValueFrom(service.$application);

    expect(applicationService.fetchApplication).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.fileNumber).toEqual('1');
  });

  it('should publish the updated application for update', async () => {
    applicationService.updateApplication.mockResolvedValue({
      fileNumber: '1',
    } as ApplicationDto);

    await service.updateApplication('1', {});
    const res = await firstValueFrom(service.$application);

    expect(applicationService.updateApplication).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.fileNumber).toEqual('1');
  });
});
