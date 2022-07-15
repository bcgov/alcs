import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApplicationService } from '../application/application.service';
import {
  MockType,
  repositoryMockFactory,
} from '../common/utils/test-helpers/mockTypes';
import { Repository } from 'typeorm';
import { ApplicationStatusDto } from './application-status.dto';
import { ApplicationStatus } from './application-status.entity';
import {
  ApplicationStatusService,
  defaultApplicationStatus,
} from './application-status.service';
import { Application } from '../application/application.entity';
import { initApplicationStatusMockEntity } from '../common/utils/test-helpers/mockEntities';

describe('ApplicationStatusService', () => {
  let applicationStatusService: ApplicationStatusService;
  let applicationsStatusRepositoryMock: MockType<Repository<ApplicationStatus>>;
  let applicationService: ApplicationService;

  const applicationStatusDto: ApplicationStatusDto = {
    code: 'app_1',
    description: 'app desc 1',
  };
  const applicationStatusMockEntity = initApplicationStatusMockEntity();

  beforeEach(async () => {
    const applicationStatusModule: TestingModule =
      await Test.createTestingModule({
        providers: [
          ApplicationStatusService,
          ApplicationService,
          {
            provide: getRepositoryToken(ApplicationStatus),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(Application),
            useFactory: repositoryMockFactory,
          },
        ],
      }).compile();

    applicationsStatusRepositoryMock = applicationStatusModule.get(
      getRepositoryToken(ApplicationStatus),
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
    jest
      .spyOn(applicationService, 'resetApplicationStatus')
      .mockImplementation();
  });

  it('should be defined', () => {
    expect(applicationStatusService).toBeDefined();
    expect(applicationService).toBeDefined();
  });

  it('can create application_status', async () => {
    expect(
      await applicationStatusService.create(applicationStatusDto),
    ).toStrictEqual(applicationStatusMockEntity);
  });

  it('can getall application statuses', async () => {
    expect(await applicationStatusService.getAll()).toStrictEqual([
      applicationStatusMockEntity,
    ]);
  });

  it('can delete application status', async () => {
    await applicationStatusService.delete('app_1');

    expect(
      await applicationService.resetApplicationStatus,
    ).toHaveBeenCalledTimes(1);
  });

  it('does not fail if application status does not exist', async () => {
    applicationsStatusRepositoryMock.findOne.mockReturnValue(null);

    await applicationStatusService.delete('app_2');

    expect(
      await applicationService.resetApplicationStatus,
    ).toHaveBeenCalledTimes(0);
  });

  it('cannot delete default application status', async () => {
    applicationsStatusRepositoryMock.findOne.mockReturnValue(null);

    expect(
      applicationStatusService.delete(defaultApplicationStatus.code),
    ).rejects.toMatchObject(new Error('You cannot delete default status'));
    expect(
      await applicationService.resetApplicationStatus,
    ).toHaveBeenCalledTimes(0);
  });
});
