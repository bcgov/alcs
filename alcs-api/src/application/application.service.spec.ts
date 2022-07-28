import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { initApplicationMockEntity } from '../common/utils/test-helpers/mockEntities';
import {
  MockType,
  repositoryMockFactory,
} from '../common/utils/test-helpers/mockTypes';
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
    applicationRepositoryMock.update.mockReturnValue(applicationMockEntity);
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
      await applicationService.getAll([applicationMockEntity.statusUuid]),
    ).toStrictEqual([applicationMockEntity]);
  });

  it('should delete application', async () => {
    await applicationService.delete(applicationMockEntity.fileNumber);
    expect(applicationService.delete).toBeDefined();
  });

  it('should call update when resetApplicationStatus is performed', async () => {
    const targetStatusId = 'app_st_2';
    jest
      .spyOn(applicationService, 'getAll')
      .mockImplementation(async () => [applicationMockEntity]);
    jest.spyOn(applicationService, 'createOrUpdate').mockImplementation();

    await applicationService.resetApplicationStatus(
      applicationMockEntity.statusUuid,
      targetStatusId,
    );

    expect(applicationRepositoryMock.update).toBeCalledTimes(1);
  });

  it('should call save when an Application is created', async () => {
    const applicationMockEntity = initApplicationMockEntity();
    applicationRepositoryMock.findOne
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(applicationMockEntity);

    const payload: Partial<Application> = {
      title: applicationMockEntity.title,
      fileNumber: applicationMockEntity.fileNumber,
      applicant: applicationMockEntity.applicant,
      statusUuid: applicationMockEntity.statusUuid,
    };

    expect(await applicationService.createOrUpdate(payload)).toStrictEqual(
      applicationMockEntity,
    );
    expect(applicationRepositoryMock.save).toHaveBeenCalled();
  });

  it('should call save when an Application is updated', async () => {
    const applicationMockEntity = initApplicationMockEntity();
    applicationRepositoryMock.findOne.mockReturnValue(applicationMockEntity);

    const payload: Partial<Application> = {
      title: applicationMockEntity.title,
      fileNumber: applicationMockEntity.fileNumber,
      applicant: applicationMockEntity.applicant,
      statusUuid: applicationMockEntity.statusUuid,
    };

    expect(await applicationService.createOrUpdate(payload)).toStrictEqual(
      applicationMockEntity,
    );
    expect(applicationRepositoryMock.save).toHaveBeenCalled();
  });
});
