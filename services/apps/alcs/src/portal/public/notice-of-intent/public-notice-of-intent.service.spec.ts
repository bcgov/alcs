import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { VISIBILITY_FLAG } from '../../../alcs/application/application-document/application-document.entity';
import { NoticeOfIntentDecisionV2Service } from '../../../alcs/notice-of-intent-decision/notice-of-intent-decision-v2/notice-of-intent-decision-v2.service';
import { NoticeOfIntentDocument } from '../../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.entity';
import { NoticeOfIntentDocumentService } from '../../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentSubmissionToSubmissionStatus } from '../../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.entity';
import { NoticeOfIntentType } from '../../../alcs/notice-of-intent/notice-of-intent-type/notice-of-intent-type.entity';
import { NoticeOfIntent } from '../../../alcs/notice-of-intent/notice-of-intent.entity';
import { NoticeOfIntentService } from '../../../alcs/notice-of-intent/notice-of-intent.service';
import { PublicAutomapperProfile } from '../../../common/automapper/public.automapper.profile';
import { NoticeOfIntentParcelService } from '../../notice-of-intent-submission/notice-of-intent-parcel/notice-of-intent-parcel.service';
import { NoticeOfIntentSubmission } from '../../notice-of-intent-submission/notice-of-intent-submission.entity';
import { NoticeOfIntentSubmissionService } from '../../notice-of-intent-submission/notice-of-intent-submission.service';
import { PublicNoticeOfIntentService } from './public-notice-of-intent.service';

describe('PublicNoticeOfIntentService', () => {
  let service: PublicNoticeOfIntentService;
  let mockNOIService: DeepMocked<NoticeOfIntentService>;
  let mockNOISubService: DeepMocked<NoticeOfIntentSubmissionService>;
  let mockNOIParcelService: DeepMocked<NoticeOfIntentParcelService>;
  let mockNOIDocService: DeepMocked<NoticeOfIntentDocumentService>;
  let mockNOIDecService: DeepMocked<NoticeOfIntentDecisionV2Service>;

  beforeEach(async () => {
    mockNOIService = createMock();
    mockNOISubService = createMock();
    mockNOIParcelService = createMock();
    mockNOIDocService = createMock();
    mockNOIDecService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        PublicNoticeOfIntentService,
        PublicAutomapperProfile,
        {
          provide: NoticeOfIntentService,
          useValue: mockNOIService,
        },
        {
          provide: NoticeOfIntentSubmissionService,
          useValue: mockNOISubService,
        },
        {
          provide: NoticeOfIntentParcelService,
          useValue: mockNOIParcelService,
        },
        {
          provide: NoticeOfIntentDocumentService,
          useValue: mockNOIDocService,
        },
        {
          provide: NoticeOfIntentDecisionV2Service,
          useValue: mockNOIDecService,
        },
      ],
    }).compile();

    service = module.get<PublicNoticeOfIntentService>(
      PublicNoticeOfIntentService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('load a Notice of Intent and its related data for get NOI', async () => {
    mockNOIService.getByFileNumber.mockResolvedValue(
      new NoticeOfIntent({
        dateReceivedAllItems: new Date(),
        type: new NoticeOfIntentType(),
      }),
    );
    mockNOISubService.getOrFailByFileNumber.mockResolvedValue(
      new NoticeOfIntentSubmission({
        get status() {
          return new NoticeOfIntentSubmissionToSubmissionStatus();
        },
      }),
    );
    mockNOIParcelService.fetchByFileId.mockResolvedValue([]);
    mockNOIDocService.list.mockResolvedValue([]);
    mockNOIDecService.getForPortal.mockResolvedValue([]);

    const fileId = 'file-id';
    await service.getPublicData(fileId);

    expect(mockNOIService.getByFileNumber).toHaveBeenCalledTimes(1);
    expect(mockNOISubService.getOrFailByFileNumber).toHaveBeenCalledTimes(1);
    expect(mockNOIParcelService.fetchByFileId).toHaveBeenCalledTimes(1);
    expect(mockNOIDocService.list).toHaveBeenCalledTimes(1);
    expect(mockNOIDocService.list).toHaveBeenCalledWith(fileId, [
      VISIBILITY_FLAG.PUBLIC,
    ]);
    expect(mockNOIDecService.getForPortal).toHaveBeenCalledTimes(1);
  });

  it('should call through to document service for getting files', async () => {
    const mockDoc = new NoticeOfIntentDocument({
      visibilityFlags: [VISIBILITY_FLAG.PUBLIC],
    });
    mockNOIDocService.get.mockResolvedValue(mockDoc);
    mockNOIDocService.getInlineUrl.mockResolvedValue('');

    const documentUuid = 'document-uuid';
    await service.getInlineUrl(documentUuid);

    expect(mockNOIDocService.get).toHaveBeenCalledTimes(1);
    expect(mockNOIDocService.getInlineUrl).toHaveBeenCalledTimes(1);
    expect(mockNOIDocService.getInlineUrl).toHaveBeenCalledWith(mockDoc);
  });

  it('should throw an exception when the document is not public', async () => {
    const mockDoc = new NoticeOfIntentDocument({
      visibilityFlags: [VISIBILITY_FLAG.APPLICANT],
    });
    mockNOIDocService.get.mockResolvedValue(mockDoc);

    const documentUuid = 'document-uuid';
    const promise = service.getInlineUrl(documentUuid);

    await expect(promise).rejects.toMatchObject(
      new ServiceNotFoundException('Failed to find document'),
    );

    expect(mockNOIDocService.get).toHaveBeenCalledTimes(1);
    expect(mockNOIDocService.getInlineUrl).toHaveBeenCalledTimes(0);
  });
});
