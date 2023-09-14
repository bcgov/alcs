import { CdogsService } from '@app/common/cdogs/cdogs.service';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { NotificationDocument } from '../../alcs/notification/notification-document/notification-document.entity';
import { NotificationDocumentService } from '../../alcs/notification/notification-document/notification-document.service';
import { Notification } from '../../alcs/notification/notification.entity';
import { NotificationService } from '../../alcs/notification/notification.service';
import {
  DOCUMENT_TYPE,
  DocumentCode,
} from '../../document/document-code.entity';
import { User } from '../../user/user.entity';
import { NotificationParcelService } from '../notification-submission/notification-parcel/notification-parcel.service';
import { NotificationSubmission } from '../notification-submission/notification-submission.entity';
import { NotificationSubmissionService } from '../notification-submission/notification-submission.service';
import { GenerateSrwDocumentService } from './generate-srw-document.service';
import { Document } from '../../document/document.entity';

describe('GenerateSrwDocumentService', () => {
  let service: GenerateSrwDocumentService;
  let mockCdogsService: DeepMocked<CdogsService>;
  let mockNotificationSubmissionService: DeepMocked<NotificationSubmissionService>;
  let mockLocalGovernmentService: DeepMocked<LocalGovernmentService>;
  let mockNotificationService: DeepMocked<NotificationService>;
  let mockNotificationDocumentService: DeepMocked<NotificationDocumentService>;
  let mockParcelService: DeepMocked<NotificationParcelService>;

  beforeEach(async () => {
    mockCdogsService = createMock();
    mockNotificationSubmissionService = createMock();
    mockLocalGovernmentService = createMock();
    mockNotificationService = createMock();
    mockNotificationDocumentService = createMock();
    mockParcelService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateSrwDocumentService,
        { provide: CdogsService, useValue: mockCdogsService },
        {
          provide: NotificationSubmissionService,
          useValue: mockNotificationSubmissionService,
        },
        {
          provide: LocalGovernmentService,
          useValue: mockLocalGovernmentService,
        },
        { provide: NotificationService, useValue: mockNotificationService },
        {
          provide: NotificationDocumentService,
          useValue: mockNotificationDocumentService,
        },
        {
          provide: NotificationParcelService,
          useValue: mockParcelService,
        },
      ],
    }).compile();

    service = module.get(GenerateSrwDocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call cdogs service to generate pdf', async () => {
    mockCdogsService.generateDocument.mockResolvedValue({} as any);

    mockNotificationSubmissionService.getByFileNumber.mockResolvedValue(
      new NotificationSubmission({
        fileNumber: 'fake',
        localGovernmentUuid: 'fake-lg',
        typeCode: 'NFUP',
        transferees: [],
      }),
    );

    mockParcelService.fetchByFileId.mockResolvedValue([]);

    mockNotificationDocumentService.list.mockResolvedValue([
      new NotificationDocument({
        document: new Document(),
        type: new DocumentCode({
          code: DOCUMENT_TYPE.SRW_TERMS,
        }),
      }),
    ]);
    mockNotificationService.getByFileNumber.mockResolvedValue(
      new Notification(),
    );
    mockLocalGovernmentService.getByUuid.mockResolvedValue(null);
    const userEntity = new User({
      name: 'Bruce Wayne',
    });

    const res = await service.generate('fake', userEntity);

    expect(mockCdogsService.generateDocument).toBeCalledTimes(1);
    expect(mockLocalGovernmentService.getByUuid).toBeCalledTimes(1);
    expect(res).toBeDefined();
  });
});
