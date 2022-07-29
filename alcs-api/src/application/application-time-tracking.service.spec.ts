import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessDayService } from '../providers/business-days/business-day.service';
import { ApplicationPaused } from './application-paused.entity';
import { ApplicationTimeTrackingService } from './application-time-tracking.service';
import { Application } from './application.entity';

describe('ApplicationTimeTrackingService', () => {
  let applicationPausedService: ApplicationTimeTrackingService;
  let mockBusinessDayService: DeepMocked<BusinessDayService>;
  let applicationRepositoryMock: DeepMocked<Repository<ApplicationPaused>>;

  beforeEach(async () => {
    applicationRepositoryMock = createMock<Repository<ApplicationPaused>>();
    mockBusinessDayService = createMock<BusinessDayService>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationTimeTrackingService,
        {
          provide: getRepositoryToken(ApplicationPaused),
          useValue: applicationRepositoryMock,
        },
        {
          provide: BusinessDayService,
          useValue: mockBusinessDayService,
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

  it('should return 2 active days when app is active for 3 days and paused for 1', async () => {
    const fakeUuid = 'fake-uuid';
    const pausedTime = '1.0000';
    const activeTime = 3;
    applicationRepositoryMock.query.mockResolvedValue([
      { application_uuid: fakeUuid, days: pausedTime } as any,
    ]);
    mockBusinessDayService.calculateDays.mockReturnValue(activeTime);

    const res = await applicationPausedService.fetchApplicationActiveTimes([
      { uuid: fakeUuid, auditCreatedAt: Date.now() } as Application,
    ]);

    expect(res.size).toEqual(1);
    expect(res.get(fakeUuid)).toBeTruthy();
    expect(res.get(fakeUuid).activeDays).toEqual(2);
    expect(res.get(fakeUuid).pausedDays).toEqual(1);
  });

  it('should return 3 active days when app is active for 3 days and never paused', async () => {
    const fakeUuid = 'fake-uuid';
    const activeTime = 3;
    applicationRepositoryMock.query.mockResolvedValue([]);
    mockBusinessDayService.calculateDays.mockReturnValue(activeTime);

    const res = await applicationPausedService.fetchApplicationActiveTimes([
      { uuid: fakeUuid, createdAt: new Date() } as Application,
    ]);

    expect(res.size).toEqual(1);
    expect(res.get(fakeUuid)).toBeTruthy();
    expect(res.get(fakeUuid).activeDays).toEqual(3);
    expect(res.get(fakeUuid).pausedDays).toEqual(0);
  });

  it('should return 0 active days when app is active for 0 and paused for 1', async () => {
    const fakeUuid = 'fake-uuid';
    const activeTime = 0;
    mockBusinessDayService.calculateDays.mockReturnValue(activeTime);

    applicationRepositoryMock.query.mockResolvedValue([
      { application_uuid: fakeUuid, days: 1 } as any,
    ]);

    const res = await applicationPausedService.fetchApplicationActiveTimes([
      { uuid: fakeUuid, createdAt: new Date() } as Application,
    ]);

    expect(res.size).toEqual(1);
    expect(res.get(fakeUuid)).toBeTruthy();
    expect(res.get(fakeUuid).activeDays).toEqual(0);
    expect(res.get(fakeUuid).pausedDays).toEqual(1);
  });

  it('should map multiple applications at the same time if one has paused and one does not', async () => {
    const fakeUuid1 = 'fake-uuid-1';
    const fakeUuid2 = 'fake-uuid-2';
    const activeTime = 3;
    const pausedTime = 1;
    applicationRepositoryMock.query.mockResolvedValue([
      { application_uuid: fakeUuid1, days: pausedTime } as any,
    ]);
    mockBusinessDayService.calculateDays.mockReturnValue(activeTime);

    const res = await applicationPausedService.fetchApplicationActiveTimes([
      { uuid: fakeUuid1, auditCreatedAt: Date.now() } as Application,
      { uuid: fakeUuid2, auditCreatedAt: Date.now() } as Application,
    ]);

    expect(res.size).toEqual(2);
    expect(res.get(fakeUuid1)).toBeTruthy();
    expect(res.get(fakeUuid1).activeDays).toEqual(2);
    expect(res.get(fakeUuid1).pausedDays).toEqual(1);
    expect(res.get(fakeUuid2)).toBeTruthy();
    expect(res.get(fakeUuid2).activeDays).toEqual(3);
    expect(res.get(fakeUuid2).pausedDays).toEqual(0);
  });
});
