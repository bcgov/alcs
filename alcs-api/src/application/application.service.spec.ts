import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceValidationException } from '../common/exceptions/base.exception';
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
      await applicationService.getAll([applicationMockEntity.statusId]),
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
    jest.spyOn(applicationService, 'create').mockImplementation();

    await applicationService.resetApplicationStatus(
      applicationMockEntity.statusId,
      targetStatusId,
    );

    expect(applicationRepositoryMock.update).toBeCalledTimes(1);
  });

  it('should call save when an Application is created', async () => {
    const applicationMockEntity = initApplicationMockEntity();
    applicationRepositoryMock.findOne.mockReturnValue(null);

    const payload: Partial<Application> = {
      title: applicationMockEntity.title,
      fileNumber: applicationMockEntity.fileNumber,
      body: applicationMockEntity.body,
      statusId: applicationMockEntity.statusId,
    };

    expect(await applicationService.create(payload)).toStrictEqual(
      applicationMockEntity,
    );
    expect(applicationRepositoryMock.save).toHaveBeenCalled();
  });

  it('should call update when update is called', async () => {
    const applicationMockEntity = initApplicationMockEntity();

    //Return old entity on first call, new one on second call
    applicationRepositoryMock.findOne
      .mockReturnValueOnce({
        ...applicationMockEntity,
        title: 'Old Title',
      })
      .mockReturnValueOnce(applicationMockEntity);

    const payload: Partial<Application> = {
      title: applicationMockEntity.title,
      fileNumber: applicationMockEntity.fileNumber,
      body: applicationMockEntity.body,
      statusId: applicationMockEntity.statusId,
    };

    expect(await applicationService.update(payload)).toStrictEqual(
      applicationMockEntity,
    );
    expect(applicationRepositoryMock.update).toHaveBeenCalled();
    expect(applicationRepositoryMock.findOne).toHaveBeenCalledTimes(2);
  });

  it('should throw an exception when update is called and the entity does not exist', async () => {
    const applicationMockEntity = initApplicationMockEntity();

    //Return old entity on first call, new one on second call
    applicationRepositoryMock.findOne.mockReturnValue(undefined);

    const payload: Partial<Application> = {
      title: applicationMockEntity.title,
      fileNumber: applicationMockEntity.fileNumber,
      body: applicationMockEntity.body,
      statusId: applicationMockEntity.statusId,
    };

    await expect(applicationService.update(payload)).rejects.toMatchObject(
      new ServiceValidationException('Application not found'),
    );
    expect(applicationRepositoryMock.findOne).toHaveBeenCalledTimes(1);
  });
});
