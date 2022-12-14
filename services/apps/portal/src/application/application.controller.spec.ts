import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { mockKeyCloakProviders } from '../../test/mocks/mockTypes';
import { ApplicationGrpcResponse } from '../alcs/application-grpc/alcs-application.message.interface';
import { ApplicationProfile } from '../common/automapper/application.automapper.profile';
import { ServiceNotFoundException } from '../common/exceptions/base.exception';
import { User } from '../user/user.entity';
import { ApplicationDocument } from './application-document/application-document.entity';
import { ApplicationDocumentService } from './application-document/application-document.service';
import { ApplicationController } from './application.controller';
import { ApplicationSubmitToAlcsDto } from './application.dto';
import { Application } from './application.entity';
import { ApplicationService } from './application.service';

describe('ApplicationController', () => {
  let controller: ApplicationController;
  let mockAppService: DeepMocked<ApplicationService>;
  let mockDocumentService: DeepMocked<ApplicationDocumentService>;

  const localGovernmentUuid = 'local-government';
  const applicant = 'fake-applicant';

  beforeEach(async () => {
    mockAppService = createMock();
    mockDocumentService = createMock();

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
    mockAppService.getByFileId.mockResolvedValue(new Application());

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

    expect(mockAppService.getByFileId).toHaveBeenCalledTimes(1);
    expect(mockAppService.mapToDTOs).toHaveBeenCalledTimes(1);
  });

  it('should throw an exception if app doest not exist', async () => {
    mockAppService.getByFileId.mockResolvedValue(null);
    const mockFileId = 'file-id';

    const promise = controller.update(
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
    await expect(promise).rejects.toMatchObject(
      new ServiceNotFoundException(
        'Failed to find application with given File ID and User',
      ),
    );
    expect(mockAppService.getByFileId).toHaveBeenCalledTimes(1);
  });

  it('should call out to service on submitAlcs', async () => {
    const mockFileId = 'file-id';
    mockAppService.getByFileId.mockResolvedValue({} as Application);
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

    expect(mockAppService.getByFileId).toHaveBeenCalledTimes(1);
    expect(mockAppService.submitToAlcs).toHaveBeenCalledTimes(1);
  });

  it('should throw an exception on submitAlcs if app doest not exist', async () => {
    mockAppService.getByFileId.mockResolvedValue(null);

    const promise = controller.submitToAlcs(
      'file-id',
      {} as ApplicationSubmitToAlcsDto,
      {
        user: {
          entity: new User(),
        },
      },
    );
    await expect(promise).rejects.toMatchObject(
      new ServiceNotFoundException(
        `Failed to find application with given File ID file-id and User`,
      ),
    );
    expect(mockAppService.getByFileId).toHaveBeenCalledTimes(1);
  });
});
