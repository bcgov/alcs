import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { mockKeyCloakProviders } from '../../test/mocks/mockTypes';
import { ApplicationGrpcResponse } from '../alcs/application-grpc/alcs-application.message.interface';
import { LocalGovernmentService } from '../alcs/local-government/local-government.service';
import { ApplicationProfile } from '../common/automapper/application.automapper.profile';
import { User } from '../user/user.entity';
import { ApplicationDocument } from './application-document/application-document.entity';
import { ApplicationDocumentService } from './application-document/application-document.service';
import { ApplicationController } from './application.controller';
import { ApplicationDto, ApplicationSubmitToAlcsDto } from './application.dto';
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

    mockAppService.mapToDTOs.mockResolvedValue([]);

    mockDocumentService.attachDocument.mockResolvedValue(
      new ApplicationDocument({
        uploadedBy: new User({
          name: 'Bruce Wayne',
        }),
      }),
    );
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
    mockAppService.getByBceidBusinessGuid.mockResolvedValue([]);

    const applications = await controller.getApplications({
      user: {
        entity: new User({
          bceidBusinessGuid,
        }),
      },
    });

    expect(applications).toBeDefined();
    expect(mockAppService.getByBceidBusinessGuid).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when fetching an application', async () => {
    mockAppService.mapToDTOs.mockResolvedValue([{} as ApplicationDto]);

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

  it('should call out to service when attaching a document', async () => {
    const document = await controller.attachDocument(
      {
        isMultipart: () => true,
        file: () => ({
          fields: {
            localGovernment: localGovernmentUuid,
            applicant,
          },
        }),
        user: {
          entity: new User({
            name: 'Bruce Wayne',
          }),
        },
      },
      'file-id',
    );

    expect(document).toBeDefined();
    expect(document!.uploadedBy).toEqual('Bruce Wayne');
    expect(mockDocumentService.attachDocument).toHaveBeenCalledTimes(1);
  });

  it('should call out to service for update and map', async () => {
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

    expect(mockAppService.getIfCreator).toHaveBeenCalledTimes(1);
    expect(mockAppService.mapToDTOs).toHaveBeenCalledTimes(1);
  });

  it('should call out to service on submitAlcs', async () => {
    const mockFileId = 'file-id';
    mockAppService.submitToAlcs.mockResolvedValue(
      {} as ApplicationGrpcResponse,
    );

    await controller.submitToAlcs(
      mockFileId,
      {} as ApplicationSubmitToAlcsDto,
      {
        user: {
          entity: new User(),
        },
      },
    );

    expect(mockAppService.getIfCreator).toHaveBeenCalledTimes(1);
    expect(mockAppService.submitToAlcs).toHaveBeenCalledTimes(1);
  });
});
