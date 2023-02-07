import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mockKeyCloakProviders } from '../../test/mocks/mockTypes';
import { ApplicationGrpcResponse } from '../alcs/application-grpc/alcs-application.message.interface';
import { LocalGovernmentService } from '../alcs/local-government/local-government.service';
import { ApplicationProfile } from '../common/automapper/application.automapper.profile';
import { User } from '../user/user.entity';
import { ApplicationDocumentService } from './application-document/application-document.service';
import { APPLICATION_STATUS } from './application-status/application-status.dto';
import { ApplicationStatus } from './application-status/application-status.entity';
import { ApplicationController } from './application.controller';
import { ApplicationDetailedDto, ApplicationDto } from './application.dto';
import { Application } from './application.entity';
import { ApplicationService } from './application.service';

describe('ApplicationController', () => {
  let controller: ApplicationController;
  let mockAppService: DeepMocked<ApplicationService>;
  let mockDocumentService: DeepMocked<ApplicationDocumentService>;
  let mockLgService: DeepMocked<LocalGovernmentService>;

  const localGovernmentUuid = 'local-government';
  const applicant = 'fake-applicant';

  beforeEach(async () => {
    mockAppService = createMock();
    mockDocumentService = createMock();
    mockLgService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationController],
      providers: [
        ApplicationProfile,
        {
          provide: ApplicationService,
          useValue: mockAppService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: LocalGovernmentService,
          useValue: mockLgService,
        },
        ...mockKeyCloakProviders,
      ],
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
    }).compile();

    controller = module.get<ApplicationController>(ApplicationController);

    mockAppService.update.mockResolvedValue(
      new Application({
        applicant: applicant,
        localGovernmentUuid,
      }),
    );

    mockAppService.create.mockResolvedValue('2');
    mockAppService.getIfCreator.mockResolvedValue(new Application());
    mockAppService.verifyAccess.mockResolvedValue(new Application());

    mockAppService.mapToDTOs.mockResolvedValue([]);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call out to service when fetching applications', async () => {
    mockAppService.getByUser.mockResolvedValue([]);

    const applications = await controller.getApplications({
      user: {
        entity: new User(),
      },
    });

    expect(applications).toBeDefined();
    expect(mockAppService.getByUser).toHaveBeenCalledTimes(1);
  });

  it('should fetch by bceid if user has same guid as a local government', async () => {
    const bceidBusinessGuid = 'business-guid';
    mockLgService.get.mockResolvedValue([
      {
        uuid: '',
        bceidBusinessGuid,
        name: 'fake-name',
        isFirstNation: false,
      },
    ]);
    mockAppService.getForGovernment.mockResolvedValue([]);

    const applications = await controller.getApplications({
      user: {
        entity: new User({
          bceidBusinessGuid,
        }),
      },
    });

    expect(applications).toBeDefined();
    expect(mockAppService.getForGovernment).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when cancelling an application', async () => {
    mockAppService.mapToDTOs.mockResolvedValue([{} as ApplicationDto]);
    mockAppService.getIfCreator.mockResolvedValue(
      new Application({
        status: new ApplicationStatus({
          code: APPLICATION_STATUS.IN_PROGRESS,
        }),
      }),
    );
    mockAppService.cancel.mockResolvedValue();

    const application = await controller.cancel('file-id', {
      user: {
        entity: new User(),
      },
    });

    expect(application).toBeDefined();
    expect(mockAppService.cancel).toHaveBeenCalledTimes(1);
    expect(mockAppService.getIfCreator).toHaveBeenCalledTimes(1);
  });

  it('should throw an exception when trying to cancel an application that is not in progress', async () => {
    mockAppService.getIfCreator.mockResolvedValue(
      new Application({
        status: new ApplicationStatus({
          code: APPLICATION_STATUS.CANCELLED,
        }),
      }),
    );

    const promise = controller.cancel('file-id', {
      user: {
        entity: new User(),
      },
    });

    await expect(promise).rejects.toMatchObject(
      new BadRequestException('Can only cancel in progress Applications'),
    );
    expect(mockAppService.cancel).toHaveBeenCalledTimes(0);
    expect(mockAppService.getIfCreator).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when fetching an application', async () => {
    mockAppService.mapToDetailedDTO.mockResolvedValue(
      {} as ApplicationDetailedDto,
    );

    const application = await controller.getApplication(
      {
        user: {
          entity: new User(),
        },
      },
      'file-id',
    );

    expect(application).toBeDefined();
    expect(mockAppService.getIfCreator).toHaveBeenCalledTimes(1);
  });

  it('should fetch application by bceid if user has same guid as a local government', async () => {
    const bceidBusinessGuid = 'business-guid';
    mockLgService.getByGuid.mockResolvedValue({
      uuid: '',
      bceidBusinessGuid,
      name: 'fake-name',
      isFirstNation: false,
    });
    const mockApplication = new Application();
    mockAppService.getForGovernmentByFileId.mockResolvedValue(mockApplication);
    mockAppService.mapToDetailedDTO.mockResolvedValue(
      {} as ApplicationDetailedDto,
    );

    const application = await controller.getApplication(
      {
        user: {
          entity: new User({
            bceidBusinessGuid,
          }),
        },
      },
      'file-id',
    );

    expect(application).toBeDefined();
    expect(mockAppService.getForGovernmentByFileId).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when creating an application', async () => {
    mockAppService.create.mockResolvedValue('');
    mockAppService.mapToDTOs.mockResolvedValue([{} as ApplicationDto]);

    const application = await controller.create(
      {
        user: {
          entity: new User(),
        },
      },
      {
        type: '',
      },
    );

    expect(application).toBeDefined();
    expect(mockAppService.create).toHaveBeenCalledTimes(1);
  });

  it('should call out to service for update and map', async () => {
    mockAppService.mapToDetailedDTO.mockResolvedValue(
      {} as ApplicationDetailedDto,
    );

    await controller.update(
      'file-id',
      {
        localGovernmentUuid,
        applicant,
      },
      {
        user: {
          entity: new User(),
        },
      },
    );

    expect(mockAppService.verifyAccess).toHaveBeenCalledTimes(1);
    expect(mockAppService.mapToDetailedDTO).toHaveBeenCalledTimes(1);
  });

  it('should call out to service on submitAlcs if application type is TURP', async () => {
    const mockFileId = 'file-id';
    mockAppService.submitToAlcs.mockResolvedValue(
      {} as ApplicationGrpcResponse,
    );
    mockAppService.getIfCreator.mockResolvedValue(
      new Application({
        typeCode: 'TURP',
      }),
    );

    await controller.submitAsApplicant(mockFileId, {
      user: {
        entity: new User(),
      },
    });

    expect(mockAppService.getIfCreator).toHaveBeenCalledTimes(1);
    expect(mockAppService.submitToAlcs).toHaveBeenCalledTimes(1);
  });

  it('should submit to LG if application type is NOT-TURP', async () => {
    const mockFileId = 'file-id';
    mockAppService.submitToLg.mockResolvedValue();
    mockAppService.getIfCreator.mockResolvedValue(
      new Application({
        typeCode: 'NOT-TURP',
      }),
    );

    await controller.submitAsApplicant(mockFileId, {
      user: {
        entity: new User(),
      },
    });

    expect(mockAppService.getIfCreator).toHaveBeenCalledTimes(1);
    expect(mockAppService.submitToLg).toHaveBeenCalledTimes(1);
  });
});
