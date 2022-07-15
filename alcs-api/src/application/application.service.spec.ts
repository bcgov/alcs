import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationStatus } from '../application-status/application-status.entity';
import { MockType, repositoryMockFactory } from '../common/utils/mockTypes';
import { ApplicationCreateDto } from './application.dto';
import { Application } from './application.entity';
import { ApplicationService } from './application.service';

describe('ApplicationService', () => {
  let applicationService: ApplicationService;
  let applicationRepositoryMock: MockType<Repository<Application>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationService,
        {
          provide: getRepositoryToken(Application),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    applicationRepositoryMock = module.get(getRepositoryToken(Application));
    applicationService = module.get<ApplicationService>(ApplicationService);
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

  const initApplicationMockEntity = (): Application => {
    const applicationEntity = new Application();
    applicationEntity.title = 'app_1';
    applicationEntity.number = 'app_1';
    applicationEntity.body = 'app desc 1';
    applicationEntity.id = '1111-1111-1111-1111';
    applicationEntity.auditDeletedDateAt = new Date(2022, 1, 1, 1, 1, 1, 1);
    applicationEntity.auditCreatedAt = 111111111;
    applicationEntity.auditUpdatedAt = 111111111;
    applicationEntity.status = initApplicationStatusMockEntity();
    applicationEntity.statusId = applicationEntity.status.id;

    return applicationEntity;
  };

  it('should be defined', () => {
    expect(applicationService).toBeDefined();
  });

  it('can getall applications', async () => {
    const applicationMockEntity = initApplicationMockEntity();

    applicationRepositoryMock.find.mockReturnValue([applicationMockEntity]);

    expect(await applicationService.getAll()).toStrictEqual([
      applicationMockEntity,
    ]);
  });

  it('can getall applications by status', async () => {
    const applicationMockEntity = initApplicationMockEntity();

    applicationRepositoryMock.find.mockReturnValue([applicationMockEntity]);

    expect(
      await applicationService.getAll([applicationMockEntity.statusId]),
    ).toStrictEqual([applicationMockEntity]);
  });

  it('can delete application', async () => {
    const applicationMockEntity = initApplicationMockEntity();
    applicationRepositoryMock.findOne.mockReturnValue(applicationMockEntity);

    await applicationService.delete(applicationMockEntity.number);
    expect(applicationService.delete).toBeDefined();
  });

  it('can reset application', async () => {
    const applicationMockEntity = initApplicationMockEntity();
    const targetStatusId = 'app_st_2';
    jest
      .spyOn(applicationService, 'getAll')
      .mockImplementation(async () => [applicationMockEntity]);
    jest.spyOn(applicationService, 'createOrUpdate').mockImplementation();

    await applicationService.resetApplicationStatus(
      applicationMockEntity.statusId,
      targetStatusId,
    );

    expect(applicationService.getAll).toBeCalledTimes(1);
    expect(applicationService.createOrUpdate).toBeCalledTimes(1);
    expect(applicationMockEntity.statusId).toStrictEqual(targetStatusId);
  });

  it('can create|update application', async () => {
    const applicationMockEntity = initApplicationMockEntity();
    applicationRepositoryMock.findOne.mockReturnValue(null);
    applicationRepositoryMock.save.mockReturnValue(applicationMockEntity);

    const payload: ApplicationCreateDto = {
      title: applicationMockEntity.title,
      number: applicationMockEntity.number,
      body: applicationMockEntity.body,
      statusId: applicationMockEntity.statusId,
    };

    expect(await applicationService.createOrUpdate(payload)).toStrictEqual(
      applicationMockEntity,
    );
  });
});
