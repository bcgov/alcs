import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { doc } from 'prettier';
import { mockKeyCloakProviders } from '../../test/mocks/mockTypes';
import { ApplicationProfile } from '../common/automapper/application.automapper.profile';
import { User } from '../user/user.entity';
import { ApplicationDocument } from './application-document/application-document.entity';
import { ApplicationDocumentService } from './application-document/application-document.service';
import { ApplicationController } from './application.controller';
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

  it('should call out to service for update and map the resulting entity', async () => {
    const app = await controller.update(
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

    expect(app).toBeDefined();
    expect(app!.applicant).toEqual(applicant);
    expect(app!.localGovernmentUuid).toEqual(localGovernmentUuid);
  });
});
