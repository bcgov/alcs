import { createMock } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { initApplicationStatusMockEntity } from '../../common/utils/test-helpers/mockEntities';
import {
  MockType,
  repositoryMockFactory,
} from '../../common/utils/test-helpers/mockTypes';
import { ApplicationTimeTrackingService } from '../application-time-tracking.service';
import { Application } from '../application.entity';
import { ApplicationService } from '../application.service';
import { ApplicationStatusDto } from './application-status.dto';
import { CardStatus } from './application-status.entity';
import { ApplicationStatusService } from './application-status.service';

describe('ApplicationStatusService', () => {
  let applicationStatusService: ApplicationStatusService;
  let applicationsStatusRepositoryMock: MockType<Repository<CardStatus>>;
  let applicationService: ApplicationService;

  const applicationStatusDto: ApplicationStatusDto = {
    code: 'app_1',
    description: 'app desc 1',
    label: 'app_label',
  };
  const applicationStatusMockEntity = initApplicationStatusMockEntity();

  beforeEach(async () => {
    applicationService = createMock<ApplicationService>();

    const applicationStatusModule: TestingModule =
      await Test.createTestingModule({
        providers: [
          ApplicationStatusService,
          {
            provide: ApplicationService,
            useValue: applicationService,
          },
          {
            provide: ApplicationTimeTrackingService,
            useValue: {},
          },
          {
            provide: getRepositoryToken(CardStatus),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(Application),
            useFactory: repositoryMockFactory,
          },
        ],
      }).compile();

    applicationsStatusRepositoryMock = applicationStatusModule.get(
      getRepositoryToken(CardStatus),
    );
    applicationStatusService =
      applicationStatusModule.get<ApplicationStatusService>(
        ApplicationStatusService,
      );
    applicationService =
      applicationStatusModule.get<ApplicationService>(ApplicationService);

    applicationsStatusRepositoryMock.findOne.mockReturnValue(
      applicationStatusMockEntity,
    );
    applicationsStatusRepositoryMock.save.mockReturnValue(
      applicationStatusMockEntity,
    );
    applicationsStatusRepositoryMock.find.mockReturnValue([
      applicationStatusMockEntity,
    ]);
  });

  it('should be defined', () => {
    expect(applicationStatusService).toBeDefined();
    expect(applicationService).toBeDefined();
  });

  it('should create application_status', async () => {
    expect(
      await applicationStatusService.create(applicationStatusDto),
    ).toStrictEqual(applicationStatusMockEntity);
  });
});
