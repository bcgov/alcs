import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { initApplicationMockEntity } from '../common/utils/test-helpers/mockEntities';
import {
  MockType,
  repositoryMockFactory,
} from '../common/utils/test-helpers/mockTypes';
import { ApplicationCreateDto } from './application.dto';
import { Application } from './application.entity';
import { ApplicationService } from './application.service';

describe('ApplicationService', () => {
  let applicationService: ApplicationService;
  let applicationRepositoryMock: MockType<Repository<Application>>;
  const applicationMockEntity = initApplicationMockEntity();

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

    const applicationMockEntity = initApplicationMockEntity();
    applicationRepositoryMock.find.mockReturnValue([applicationMockEntity]);
    applicationRepositoryMock.findOne.mockReturnValue(applicationMockEntity);
    applicationRepositoryMock.save.mockReturnValue(applicationMockEntity);
  });

  it('should be defined', () => {
    expect(applicationService).toBeDefined();
  });

  it('should getall applications', async () => {
    expect(await applicationService.getAll()).toStrictEqual([
      applicationMockEntity,
    ]);
  });

  it('should getall applications by status', async () => {
    expect(
      await applicationService.getAll([applicationMockEntity.statusId]),
    ).toStrictEqual([applicationMockEntity]);
  });

  it('should delete application', async () => {
    await applicationService.delete(applicationMockEntity.fileNumber);
    expect(applicationService.delete).toBeDefined();
  });

  it('should reset application', async () => {
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

  it('should create|update application', async () => {
    const applicationMockEntity = initApplicationMockEntity();
    applicationRepositoryMock.findOne.mockReturnValue(null);

    const payload: ApplicationCreateDto = {
      title: applicationMockEntity.title,
      number: applicationMockEntity.fileNumber,
      body: applicationMockEntity.body,
      statusId: applicationMockEntity.statusId,
    };

    expect(await applicationService.createOrUpdate(payload)).toStrictEqual(
      applicationMockEntity,
    );
  });
});
