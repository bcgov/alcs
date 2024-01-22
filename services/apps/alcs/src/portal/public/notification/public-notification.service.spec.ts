import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { VISIBILITY_FLAG } from '../../../alcs/application/application-document/application-document.entity';
import { NotificationDocument } from '../../../alcs/notification/notification-document/notification-document.entity';
import { NotificationDocumentService } from '../../../alcs/notification/notification-document/notification-document.service';
import { NotificationSubmissionStatusType } from '../../../alcs/notification/notification-submission-status/notification-status-type.entity';
import { NOTIFICATION_STATUS } from '../../../alcs/notification/notification-submission-status/notification-status.dto';
import { NotificationSubmissionToSubmissionStatus } from '../../../alcs/notification/notification-submission-status/notification-status.entity';
import { NotificationType } from '../../../alcs/notification/notification-type/notification-type.entity';
import { Notification } from '../../../alcs/notification/notification.entity';
import { NotificationService } from '../../../alcs/notification/notification.service';
import { PublicAutomapperProfile } from '../../../common/automapper/public.automapper.profile';
import { NotificationParcelService } from '../../notification-submission/notification-parcel/notification-parcel.service';
import { NotificationSubmission } from '../../notification-submission/notification-submission.entity';
import { NotificationSubmissionService } from '../../notification-submission/notification-submission.service';
import { PublicNotificationService } from './public-notification.service';

describe('PublicNotificationService', () => {
  let service: PublicNotificationService;
  let mockNOIService: DeepMocked<NotificationService>;
  let mockNOISubService: DeepMocked<NotificationSubmissionService>;
  let mockNOIParcelService: DeepMocked<NotificationParcelService>;
  let mockNOIDocService: DeepMocked<NotificationDocumentService>;

  beforeEach(async () => {
    mockNOIService = createMock();
    mockNOISubService = createMock();
    mockNOIParcelService = createMock();
    mockNOIDocService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        PublicNotificationService,
        PublicAutomapperProfile,
        {
          provide: NotificationService,
          useValue: mockNOIService,
        },
        {
          provide: NotificationSubmissionService,
          useValue: mockNOISubService,
        },
        {
          provide: NotificationParcelService,
          useValue: mockNOIParcelService,
        },
        {
          provide: NotificationDocumentService,
          useValue: mockNOIDocService,
        },
      ],
    }).compile();

    service = module.get<PublicNotificationService>(PublicNotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('load a Notification and its related data for get notification', async () => {
    mockNOIService.getByFileNumber.mockResolvedValue(
      new Notification({
        type: new NotificationType(),
      }),
    );
    mockNOISubService.getOrFailByFileNumber.mockResolvedValue(
      new NotificationSubmission({
        get status() {
          return new NotificationSubmissionToSubmissionStatus({
            statusType: new NotificationSubmissionStatusType({
              code: NOTIFICATION_STATUS.ALC_RESPONSE_SENT,
            }),
          });
        },
      }),
    );
    mockNOIParcelService.fetchByFileId.mockResolvedValue([]);
    mockNOIDocService.list.mockResolvedValue([]);

    const fileId = 'file-id';
    await service.getPublicData(fileId);

    expect(mockNOIService.getByFileNumber).toHaveBeenCalledTimes(1);
    expect(mockNOISubService.getOrFailByFileNumber).toHaveBeenCalledTimes(1);
    expect(mockNOIParcelService.fetchByFileId).toHaveBeenCalledTimes(1);
    expect(mockNOIDocService.list).toHaveBeenCalledTimes(1);
    expect(mockNOIDocService.list).toHaveBeenCalledWith(fileId, [
      VISIBILITY_FLAG.PUBLIC,
    ]);
  });

  it('should call through to document service for getting files', async () => {
    const mockDoc = new NotificationDocument({
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
    const mockDoc = new NotificationDocument({
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
