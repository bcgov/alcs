import { DeepMocked, createMock } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { ApplicationTypeService } from '../application-type/application-type.service';
import { LocalGovernmentService } from '../local-government/local-government.service';
import { SubmissionTypeService } from '../submission-type/submission-type.service';
import { CodeController } from './code.controller';

describe('CodeController', () => {
  let portalController: CodeController;
  let mockLgService: DeepMocked<LocalGovernmentService>;
  let mockAppTypeService: DeepMocked<ApplicationTypeService>;
  let mockSubmissionTypeService: DeepMocked<SubmissionTypeService>;

  beforeEach(async () => {
    mockLgService = createMock();
    mockAppTypeService = createMock();
    mockSubmissionTypeService = createMock();

    const app: TestingModule = await Test.createTestingModule({
      controllers: [CodeController],
      providers: [
        CodeController,
        {
          provide: LocalGovernmentService,
          useValue: mockLgService,
        },
        {
          provide: ApplicationTypeService,
          useValue: mockAppTypeService,
        },
        {
          provide: SubmissionTypeService,
          useValue: mockSubmissionTypeService,
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    portalController = app.get<CodeController>(CodeController);

    mockLgService.get.mockResolvedValue([
      {
        uuid: 'fake-uuid',
        name: 'fake-name',
        isFirstNation: false,
        isActive: true,
      },
    ]);
    mockAppTypeService.list.mockResolvedValue([]);

    mockSubmissionTypeService.list.mockResolvedValue([
      {
        code: 'fake-code',
        portalHtmlDescription: 'fake-html',
        label: 'fake-label',
      },
    ]);
  });

  it('should call out to local government service for fetching codes', async () => {
    const codes = await portalController.loadCodes();
    expect(codes.localGovernments).toBeDefined();
    expect(codes.localGovernments.length).toBe(1);
    expect(codes.localGovernments[0].name).toEqual('fake-name');
    expect(mockAppTypeService.list).toHaveBeenCalledTimes(1);
  });

  it('should call out to local submission service for fetching codes', async () => {
    const codes = await portalController.loadCodes();
    expect(codes.submissionTypes).toBeDefined();
    expect(codes.submissionTypes.length).toBe(1);
    expect(codes.submissionTypes[0].code).toEqual('fake-code');
  });
});
