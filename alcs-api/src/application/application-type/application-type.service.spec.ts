import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { initApplicationTypeMockEntity } from '../../common/utils/test-helpers/mockEntities';
import { ApplicationType } from './application-type.entity';
import { ApplicationTypeService } from './application-type.service';

describe('ApplicationTypeService', () => {
  let applicationTypeService: ApplicationTypeService;
  let applicationsTypeRepositoryMock: DeepMocked<Repository<ApplicationType>>;

  beforeEach(async () => {
    applicationsTypeRepositoryMock = createMock<Repository<ApplicationType>>();
    const applicationTypeModule: TestingModule = await Test.createTestingModule(
      {
        providers: [
          ApplicationTypeService,
          {
            provide: getRepositoryToken(ApplicationType),
            useValue: applicationsTypeRepositoryMock,
          },
        ],
      },
    ).compile();

    applicationTypeService = applicationTypeModule.get<ApplicationTypeService>(
      ApplicationTypeService,
    );
    applicationsTypeRepositoryMock.find.mockResolvedValue([
      initApplicationTypeMockEntity(),
    ]);
  });

  it('should be defined', () => {
    expect(applicationTypeService).toBeDefined();
  });

  it('should return the mocked application type', async () => {
    expect(await applicationTypeService.getAll()).toStrictEqual([
      initApplicationTypeMockEntity(),
    ]);
  });
});
