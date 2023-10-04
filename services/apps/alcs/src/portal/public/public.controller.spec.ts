import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import {
  ApplicationDocument,
  VISIBILITY_FLAG,
} from '../../alcs/application/application-document/application-document.entity';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { ApplicationSubmissionToSubmissionStatus } from '../../alcs/application/application-submission-status/submission-status.entity';
import { Application } from '../../alcs/application/application.entity';
import { ApplicationService } from '../../alcs/application/application.service';
import { PublicAutomapperProfile } from '../../common/automapper/public.automapper.profile';
import { ApplicationParcelService } from '../application-submission/application-parcel/application-parcel.service';
import { ApplicationSubmission } from '../application-submission/application-submission.entity';
import { ApplicationSubmissionService } from '../application-submission/application-submission.service';
import { PublicController } from './public.controller';

describe('PublicSearchController', () => {
  let controller: PublicController;
  let mockAppService: DeepMocked<ApplicationService>;
  let mockAppSubService: DeepMocked<ApplicationSubmissionService>;
  let mockAppParcelService: DeepMocked<ApplicationParcelService>;
  let mockAppDocService: DeepMocked<ApplicationDocumentService>;

  beforeEach(async () => {
    mockAppService = createMock();
    mockAppSubService = createMock();
    mockAppParcelService = createMock();
    mockAppDocService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        PublicAutomapperProfile,
        {
          provide: ApplicationService,
          useValue: mockAppService,
        },
        {
          provide: ApplicationSubmissionService,
          useValue: mockAppSubService,
        },
        {
          provide: ApplicationParcelService,
          useValue: mockAppParcelService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
      controllers: [PublicController],
    }).compile();

    controller = module.get<PublicController>(PublicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('load an Application and its related data for get application', async () => {
    mockAppService.get.mockResolvedValue(
      new Application({
        dateReceivedAllItems: new Date(),
      }),
    );
    mockAppSubService.getOrFailByFileNumber.mockResolvedValue(
      new ApplicationSubmission({
        get status(): ApplicationSubmissionToSubmissionStatus {
          return new ApplicationSubmissionToSubmissionStatus();
        },
      }),
    );
    mockAppParcelService.fetchByApplicationFileId.mockResolvedValue([]);
    mockAppDocService.list.mockResolvedValue([]);

    const fileId = 'file-id';
    await controller.getApplication(fileId);

    expect(mockAppService.get).toHaveBeenCalledTimes(1);
    expect(mockAppSubService.getOrFailByFileNumber).toHaveBeenCalledTimes(1);
    expect(mockAppParcelService.fetchByApplicationFileId).toHaveBeenCalledTimes(
      1,
    );
    expect(mockAppDocService.list).toHaveBeenCalledTimes(1);
    expect(mockAppDocService.list).toHaveBeenCalledWith(fileId, [
      VISIBILITY_FLAG.PUBLIC,
    ]);
  });

  it('should call through to document service for getting files', async () => {
    const mockDoc = new ApplicationDocument({
      visibilityFlags: [VISIBILITY_FLAG.PUBLIC],
    });
    mockAppDocService.get.mockResolvedValue(mockDoc);
    mockAppDocService.getInlineUrl.mockResolvedValue('');

    const fileId = 'file-id';
    const documentUuid = 'document-uuid';
    await controller.getApplicationDocumentOpen(fileId, documentUuid);

    expect(mockAppDocService.get).toHaveBeenCalledTimes(1);
    expect(mockAppDocService.getInlineUrl).toHaveBeenCalledTimes(1);
    expect(mockAppDocService.getInlineUrl).toHaveBeenCalledWith(mockDoc);
  });

  it('should throw an exception when the document is not public', async () => {
    const mockDoc = new ApplicationDocument({
      visibilityFlags: [VISIBILITY_FLAG.APPLICANT],
    });
    mockAppDocService.get.mockResolvedValue(mockDoc);

    const fileId = 'file-id';
    const documentUuid = 'document-uuid';
    const promise = controller.getApplicationDocumentOpen(fileId, documentUuid);

    await expect(promise).rejects.toMatchObject(
      new ServiceNotFoundException('Failed to find document'),
    );

    expect(mockAppDocService.get).toHaveBeenCalledTimes(1);
    expect(mockAppDocService.getInlineUrl).toHaveBeenCalledTimes(0);
  });
});
