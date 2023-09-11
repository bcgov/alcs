import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '../toast/toast.service';
import { NotificationDetailService } from './notification-detail.service';
import { NotificationDto } from './notification.dto';
import { NotificationService } from './notification.service';

describe('NotificationDetailService', () => {
  let service: NotificationDetailService;
  let notificationService: DeepMocked<NotificationService>;

  beforeEach(() => {
    notificationService = createMock();

    TestBed.configureTestingModule({
      providers: [
        NotificationDetailService,
        {
          provide: NotificationService,
          useValue: notificationService,
        },
        {
          provide: ToastService,
          useValue: {},
        },
      ],
    });
    service = TestBed.inject(NotificationDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should publish the loaded noi', async () => {
    notificationService.fetchByFileNumber.mockResolvedValue({
      fileNumber: '1',
    } as NotificationDto);

    await service.load('1');
    const res = await firstValueFrom(service.$notification);

    expect(notificationService.fetchByFileNumber).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.fileNumber).toEqual('1');
  });

  it('should publish the updated noi for update', async () => {
    notificationService.update.mockResolvedValue({
      fileNumber: '1',
    } as NotificationDto);

    await service.update('1', {});
    const res = await firstValueFrom(service.$notification);

    expect(notificationService.update).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res!.fileNumber).toEqual('1');
  });
});
