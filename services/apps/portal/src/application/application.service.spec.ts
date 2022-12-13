import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlcsApplicationService } from '../alcs/application-grpc/alcs-application.service';
import { ApplicationTypeService } from '../alcs/application-type/application-type.service';
import { ApplicationProfile } from '../common/automapper/application.automapper.profile';
import { User } from '../user/user.entity';
import { ApplicationStatus } from './application-status/application-status.entity';
import { Application } from './application.entity';
import { ApplicationService } from './application.service';

describe('ApplicationService', () => {
  let service: ApplicationService;
  let mockAppTypeService: DeepMocked<ApplicationTypeService>;
  let mockRepository: DeepMocked<Repository<Application>>;
  let mockStatusRepository: DeepMocked<Repository<ApplicationStatus>>;

  beforeEach(async () => {
    mockRepository = createMock();
    mockStatusRepository = createMock();
    mockAppTypeService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        ApplicationService,
        ApplicationProfile,
        {
          provide: getRepositoryToken(Application),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(ApplicationStatus),
          useValue: mockStatusRepository,
        },
        {
          provide: ApplicationTypeService,
          useValue: mockAppTypeService,
        },
        {
          provide: AlcsApplicationService,
          useValue: createMock<AlcsApplicationService>(),
        },
      ],
    }).compile();

    service = module.get<ApplicationService>(ApplicationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the fetched application', async () => {
    const application = new Application();
    mockRepository.findOne.mockResolvedValue(application);

    const app = await service.getOrFail('');
    expect(app).toBe(application);
  });

  it("should throw an error if application doesn't exist", async () => {
    mockRepository.findOne.mockResolvedValue(null);

    const promise = service.getOrFail('');
    await expect(promise).rejects.toMatchObject(
      new Error('Failed to find document'),
    );
  });

  it('save a new application for create', async () => {
    mockRepository.findOne.mockResolvedValue(null);
    mockStatusRepository.findOne.mockResolvedValue(new ApplicationStatus());
    mockRepository.save.mockResolvedValue(new Application());

    const fileNumber = await service.create('type', new User());

    expect(fileNumber).toBeTruthy();
    expect(mockStatusRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should call through for get by user', async () => {
    const application = new Application();
    mockRepository.find.mockResolvedValue([application]);

    const res = await service.getByUser(new User());
    expect(mockRepository.find).toHaveBeenCalledTimes(1);
    expect(res.length).toEqual(1);
    expect(res[0]).toBe(application);
  });

  it('should call through for getByFileId', async () => {
    const application = new Application();
    mockRepository.findOne.mockResolvedValue(application);

    const res = await service.getByFileId('', new User());
    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    expect(res).toBe(application);
  });

  it('should use application type service for mapping DTOs', async () => {
    const applicant = 'Bruce Wayne';
    const typeCode = 'fake-code';

    mockAppTypeService.list.mockResolvedValue([
      {
        code: typeCode,
        portalLabel: 'portalLabel',
        htmlDescription: 'htmlDescription',
        label: 'label',
      },
    ]);

    const application = new Application({
      applicant,
      typeCode: typeCode,
    });
    mockRepository.findOne.mockResolvedValue(application);

    const res = await service.mapToDTOs([application]);
    expect(mockAppTypeService.list).toHaveBeenCalledTimes(1);
    expect(res[0].type).toEqual('label');
    expect(res[0].applicant).toEqual(applicant);
  });
});
