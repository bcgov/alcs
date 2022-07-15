import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApplicationService } from '../application/application.service';
import { MockType, repositoryMockFactory } from '../common/utils/mockTypes';
import { Repository } from 'typeorm';
import { ApplicationStatusDto } from './application-status.dto';
import { ApplicationStatus } from './application-status.entity';
import {
  ApplicationStatusService,
  defaultApplicationStatus,
} from './application-status.service';
import { Application } from '../application/application.entity';

describe('ApplicationStatusService', () => {
  let applicationStatusService: ApplicationStatusService;
  let applicationsStatusRepositoryMock: MockType<Repository<ApplicationStatus>>;
  let applicationService: ApplicationService;

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
  });

  const initApplicationStatusMockEntity = (): ApplicationStatus => {
    const applicationStatus = new ApplicationStatus();
    applicationStatus.code = 'app_1';
    applicationStatus.description = 'app desc 1';
    applicationStatus.id = '1111-1111-1111-1111';
    applicationStatus.auditDeletedDateAt = new Date(2022, 1, 1, 1, 1, 1, 1);
    applicationStatus.auditCreatedAt = 111111111;
    applicationStatus.auditUpdatedAt = 111111111;

    return applicationStatus;
  };

  it('should be defined', () => {
    expect(applicationStatusService).toBeDefined();
    expect(applicationService).toBeDefined();
  });

  it('can create application_status', async () => {
    const applicationStatusDto: ApplicationStatusDto = {
      code: 'app_1',
      description: 'app desc 1',
    };

    const applicationStatusMockEntity = initApplicationStatusMockEntity();

    applicationsStatusRepositoryMock.save.mockReturnValue(
      applicationStatusMockEntity,
    );

    expect(
      await applicationStatusService.create(applicationStatusDto),
    ).toStrictEqual(applicationStatusMockEntity);
  });

  it('can getall application statuses', async () => {
    const applicationStatusMockEntity = initApplicationStatusMockEntity();

    applicationsStatusRepositoryMock.find.mockReturnValue([
      applicationStatusMockEntity,
    ]);

    expect(await applicationStatusService.getAll()).toStrictEqual([
      applicationStatusMockEntity,
    ]);
  });

  it('can delete application status', async () => {
    const applicationStatusMockEntity = initApplicationStatusMockEntity();

    applicationsStatusRepositoryMock.findOne.mockReturnValue(
      applicationStatusMockEntity,
    );

    jest
      .spyOn(applicationService, 'resetApplicationStatus')
      .mockImplementation();

    await applicationStatusService.delete('app_1');

    expect(
      await applicationService.resetApplicationStatus,
    ).toHaveBeenCalledTimes(1);
  });

  it('does not fail if application status does not exist', async () => {
    const applicationStatusMockEntity = null;

    applicationsStatusRepositoryMock.findOne.mockReturnValue(
      applicationStatusMockEntity,
    );

    jest
      .spyOn(applicationService, 'resetApplicationStatus')
      .mockImplementation();

    await applicationStatusService.delete('app_2');

    expect(
      await applicationService.resetApplicationStatus,
    ).toHaveBeenCalledTimes(0);
  });

  it('cannot delete default application status', async () => {
    const applicationStatusMockEntity = null;

    applicationsStatusRepositoryMock.findOne.mockReturnValue(
      applicationStatusMockEntity,
    );

    jest
      .spyOn(applicationService, 'resetApplicationStatus')
      .mockImplementation();

    // FIXME for some reason expect.rejects.toThrow is not working
    let error = null;
    try {
      await applicationStatusService.delete(defaultApplicationStatus.code);
    } catch (err) {
      error = err;
    }

    expect(
      await applicationService.resetApplicationStatus,
    ).toHaveBeenCalledTimes(0);

    expect(error.message).toStrictEqual('You cannot delete default status');
  });
});
