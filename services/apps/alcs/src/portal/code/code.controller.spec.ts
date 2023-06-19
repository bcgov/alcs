import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { DeepMocked, createMock } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { ApplicationLocalGovernment } from '../../alcs/application/application-code/application-local-government/application-local-government.entity';
import { ApplicationLocalGovernmentService } from '../../alcs/application/application-code/application-local-government/application-local-government.service';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { ApplicationService } from '../../alcs/application/application.service';
import { CardType } from '../../alcs/card/card-type/card-type.entity';
import { CardService } from '../../alcs/card/card.service';
import { ApplicationSubmissionService } from '../application-submission/application-submission.service';
import { CodeController } from './code.controller';

describe('CodeController', () => {
  let portalController: CodeController;
  let mockLgService: DeepMocked<ApplicationLocalGovernmentService>;
  let mockAppService: DeepMocked<ApplicationService>;
  let mockCardService: DeepMocked<CardService>;
  let mockAppDocService: DeepMocked<ApplicationDocumentService>;
  let mockAppSubmissionService: DeepMocked<ApplicationSubmissionService>;

  beforeEach(async () => {
    mockLgService = createMock();
    mockAppService = createMock();
    mockCardService = createMock();
    mockAppDocService = createMock();
    mockAppSubmissionService = createMock();

    const app: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [CodeController],
      providers: [
        CodeController,
        {
          provide: ApplicationLocalGovernmentService,
          useValue: mockLgService,
        },
        {
          provide: ApplicationService,
          useValue: mockAppService,
        },
        {
          provide: CardService,
          useValue: mockCardService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocService,
        },
        {
          provide: ApplicationSubmissionService,
          useValue: mockAppSubmissionService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    portalController = app.get<CodeController>(CodeController);

    mockLgService.listActive.mockResolvedValue([
      new ApplicationLocalGovernment({
        uuid: 'fake-uuid',
        name: 'fake-name',
        isFirstNation: false,
      }),
    ]);
    mockAppService.fetchApplicationTypes.mockResolvedValue([]);

    mockCardService.getCardTypes.mockResolvedValue([
      new CardType({
        code: 'fake-code',
        portalHtmlDescription: 'fake-html',
        label: 'fake-label',
      }),
    ]);

    mockAppDocService.fetchTypes.mockResolvedValue([]);
    mockAppSubmissionService.listNaruSubtypes.mockResolvedValue([]);
  });

  it('should call out to local government service for fetching codes', async () => {
    const codes = await portalController.loadCodes();
    expect(codes.localGovernments).toBeDefined();
    expect(codes.localGovernments.length).toBe(1);
    expect(codes.localGovernments[0].name).toEqual('fake-name');
    expect(mockAppService.fetchApplicationTypes).toHaveBeenCalledTimes(1);
  });

  it('should call out to local submission service for fetching codes', async () => {
    const codes = await portalController.loadCodes();
    expect(codes.submissionTypes).toBeDefined();
    expect(codes.submissionTypes.length).toBe(1);
    expect(codes.submissionTypes[0].code).toEqual('fake-code');
  });
});
