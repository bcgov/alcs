import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
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

  const localGovernment = 'local-government';
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

    mockAppService.create.mockResolvedValue(
      new Application({
        applicant: applicant,
        localGovernmentUuid: localGovernment,
      }),
    );

    mockDocumentService.attachDocument.mockResolvedValue(
      new ApplicationDocument(),
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call out to service for creation and map the resulting entity', async () => {
    const app = await controller.create({
      isMultipart: () => true,
      file: () => ({
        fields: {
          localGovernment,
          applicant,
        },
      }),
      user: {
        entity: new User(),
      },
    });

    expect(app).toBeDefined();
    expect(app!.applicant).toEqual(applicant);
    expect(app!.localGovernmentUuid).toEqual(localGovernment);
  });
});
