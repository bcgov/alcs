import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { DeepMocked, createMock } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { CodeService } from '../../alcs/code/code.service';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { ApplicationService } from '../../alcs/application/application.service';
import { CardType } from '../../alcs/card/card-type/card-type.entity';
import { CardService } from '../../alcs/card/card.service';
import { NoticeOfIntentService } from '../../alcs/notice-of-intent/notice-of-intent.service';
import { User } from '../../user/user.entity';
import { ApplicationSubmissionService } from '../application-submission/application-submission.service';
import { CodeController } from './code.controller';

describe('CodeController', () => {
  let portalController: CodeController;
  let mockLgService: DeepMocked<LocalGovernmentService>;
  let mockAppService: DeepMocked<ApplicationService>;
  let mockCardService: DeepMocked<CardService>;
  let mockAppDocService: DeepMocked<ApplicationDocumentService>;
  let mockAppSubmissionService: DeepMocked<ApplicationSubmissionService>;
  let mockNoiService: DeepMocked<NoticeOfIntentService>;
  let mockCodeService: DeepMocked<CodeService>;

  beforeEach(async () => {
    mockLgService = createMock();
    mockAppService = createMock();
    mockCardService = createMock();
    mockAppDocService = createMock();
    mockAppSubmissionService = createMock();
    mockNoiService = createMock();
    mockCodeService = createMock();

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
          provide: LocalGovernmentService,
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
          provide: NoticeOfIntentService,
          useValue: mockNoiService,
        },
        {
          provide: CodeService,
          useValue: mockCodeService,
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
      new LocalGovernment({
        uuid: 'fake-uuid',
        name: 'fake-name',
        isFirstNation: false,
      }),
    ]);
    mockAppService.fetchApplicationTypes.mockResolvedValue([]);

    mockCardService.getPortalCardTypes.mockResolvedValue([
      new CardType({
        code: 'fake-code',
        portalHtmlDescription: 'fake-html',
        label: 'fake-label',
      }),
    ]);

    mockAppDocService.fetchTypes.mockResolvedValue([]);
    mockAppSubmissionService.listNaruSubtypes.mockResolvedValue([]);
    mockNoiService.listTypes.mockResolvedValue([]);
    mockCodeService.getAll.mockResolvedValue({
      region: [],
      decisionMakers: [],
      applicationStatusTypes: [],
      status: [],
      meetingTypes: [],
      type: [],
      reconsiderationTypes: [],
    });
  });

  it('should call out to local government service for fetching codes', async () => {
    const codes = await portalController.loadCodes({
      user: {
        entity: new User(),
      },
    });
    expect(codes.localGovernments).toBeDefined();
    expect(codes.localGovernments.length).toBe(1);
    expect(codes.localGovernments[0].name).toEqual('fake-name');
    expect(codes.localGovernments[0].matchesUserGuid).toBeFalsy();
    expect(mockLgService.listActive).toHaveBeenCalledTimes(1);
  });

  it('should set the matches flag correctly when users guid matches government', async () => {
    const matchingGuid = 'guid';
    mockLgService.listActive.mockResolvedValue([
      new LocalGovernment({
        uuid: 'fake-uuid',
        name: 'fake-name',
        isFirstNation: false,
        bceidBusinessGuid: matchingGuid,
      }),
    ]);

    const codes = await portalController.loadCodes({
      user: {
        entity: new User({
          bceidBusinessGuid: matchingGuid,
        }),
      },
    });

    expect(codes.localGovernments).toBeDefined();
    expect(codes.localGovernments.length).toBe(1);
    expect(codes.localGovernments[0].name).toEqual('fake-name');
    expect(codes.localGovernments[0].matchesUserGuid).toBeTruthy();
    expect(mockLgService.listActive).toHaveBeenCalledTimes(1);
  });

  it('should call out to local submission service for fetching codes', async () => {
    const codes = await portalController.loadCodes({
      user: {
        entity: new User(),
      },
    });
    expect(codes.submissionTypes).toBeDefined();
    expect(codes.submissionTypes.length).toBe(1);
    expect(codes.submissionTypes[0].code).toEqual('fake-code');
  });
});
