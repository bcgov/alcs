import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { initApplicationTypeMockEntity } from '../../common/utils/test-helpers/mockEntities';
import { ApplicationDecisionMaker } from './application-decision-maker.entity';
import { ApplicationDecisionMakerService } from './application-decision-maker.service';

describe('ApplicationTypeService', () => {
  let applicationTypeService: ApplicationDecisionMakerService;
  let applicationsTypeRepositoryMock: DeepMocked<
    Repository<ApplicationDecisionMaker>
  >;

  beforeEach(async () => {
    applicationsTypeRepositoryMock =
      createMock<Repository<ApplicationDecisionMaker>>();
    const applicationTypeModule: TestingModule = await Test.createTestingModule(
      {
        providers: [
          ApplicationDecisionMakerService,
          {
            provide: getRepositoryToken(ApplicationDecisionMaker),
            useValue: applicationsTypeRepositoryMock,
          },
        ],
      },
    ).compile();

    applicationTypeService =
      applicationTypeModule.get<ApplicationDecisionMakerService>(
        ApplicationDecisionMakerService,
      );
    applicationsTypeRepositoryMock.find.mockResolvedValue([
      initApplicationTypeMockEntity(),
    ]);
    applicationsTypeRepositoryMock.findOne.mockResolvedValue(
      initApplicationTypeMockEntity(),
    );
  });

  it('should be defined', () => {
    expect(applicationTypeService).toBeDefined();
  });

  it('should return the mocked application type in an array for getAll', async () => {
    expect(await applicationTypeService.getAll()).toStrictEqual([
      initApplicationTypeMockEntity(),
    ]);
  });

  it('should return the mocked application type for get', async () => {
    expect(await applicationTypeService.get('code')).toStrictEqual(
      initApplicationTypeMockEntity(),
    );
  });
});
