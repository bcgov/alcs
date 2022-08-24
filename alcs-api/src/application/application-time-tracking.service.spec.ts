import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationPaused } from './application-paused.entity';
import { ApplicationTimeTrackingService } from './application-time-tracking.service';
import { Application } from './application.entity';

describe('ApplicationTimeTrackingService', () => {
  let applicationPausedService: ApplicationTimeTrackingService;
  let applicationRepositoryMock: DeepMocked<Repository<ApplicationPaused>>;

  beforeEach(async () => {
    applicationRepositoryMock = createMock<Repository<ApplicationPaused>>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationTimeTrackingService,
        {
          provide: getRepositoryToken(ApplicationPaused),
          useValue: applicationRepositoryMock,
        },
      ],
    }).compile();

    applicationPausedService = module.get<ApplicationTimeTrackingService>(
      ApplicationTimeTrackingService,
    );
  });

  it('should be defined', () => {
    expect(applicationPausedService).toBeDefined();
  });

  it('should map a single application properly', async () => {
    const fakeUuid = 'fake-uuid';
    const pausedTime = 1;
    const activeTime = 2;
    applicationRepositoryMock.query.mockResolvedValue([
      {
        application_uuid: fakeUuid,
        paused_days: pausedTime,
        active_days: activeTime,
      } as any,
    ]);

    const res = await applicationPausedService.fetchActiveTimes([
      { uuid: fakeUuid, auditCreatedAt: Date.now() } as Application,
    ]);

    expect(res.size).toEqual(1);
    expect(res.get(fakeUuid)).toBeTruthy();
    expect(res.get(fakeUuid).activeDays).toEqual(activeTime);
    expect(res.get(fakeUuid).pausedDays).toEqual(pausedTime);
  });
});
