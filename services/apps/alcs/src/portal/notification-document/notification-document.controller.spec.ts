import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { VISIBILITY_FLAG } from '../../alcs/application/application-document/application-document.entity';
import { NoticeOfIntentDocument } from '../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.entity';
import { NotificationDocument } from '../../alcs/notification/notification-document/notification-document.entity';
import { NotificationDocumentService } from '../../alcs/notification/notification-document/notification-document.service';
import { NotificationService } from '../../alcs/notification/notification.service';
import { NotificationProfile } from '../../common/automapper/notification.automapper.profile';
import {
  DOCUMENT_TYPE,
  DocumentCode,
} from '../../document/document-code.entity';
import { DOCUMENT_SOURCE, DOCUMENT_SYSTEM } from '../../document/document.dto';
import { Document } from '../../document/document.entity';
import { DocumentService } from '../../document/document.service';
import { User } from '../../user/user.entity';
import { NotificationSubmission } from '../notification-submission/notification-submission.entity';
import { NotificationSubmissionService } from '../notification-submission/notification-submission.service';
import { NotificationDocumentController } from './notification-document.controller';
import { AttachExternalDocumentDto } from './notification-document.dto';

describe('NotificationDocumentController', () => {
  let controller: NotificationDocumentController;
  let mockNotificationDocumentService: DeepMocked<NotificationDocumentService>;
  let mockNotificationSubmissionService: DeepMocked<NotificationSubmissionService>;
  let mockDocumentService: DeepMocked<DocumentService>;
  let mockNotificationService: DeepMocked<NotificationService>;

  const mockDocument = new NotificationDocument({
    document: new Document({
      fileName: 'fileName',
      uploadedAt: new Date(),
      uploadedBy: new User(),
    }),
  });

  beforeEach(async () => {
    mockNotificationDocumentService = createMock();
    mockDocumentService = createMock();
    mockNotificationSubmissionService = createMock();
    mockNotificationService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [NotificationDocumentController],
      providers: [
        NotificationProfile,
        {
          provide: NotificationDocumentService,
          useValue: mockNotificationDocumentService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        {
          provide: NotificationSubmissionService,
          useValue: mockNotificationSubmissionService,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();
    controller = module.get<NotificationDocumentController>(
      NotificationDocumentController,
    );

    mockNotificationSubmissionService.getByFileNumber.mockResolvedValue(
      new NotificationSubmission(),
    );
    mockNotificationService.getUuid.mockResolvedValue('uuid');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call through to delete documents', async () => {
    mockNotificationDocumentService.delete.mockResolvedValue(mockDocument);
    mockNotificationDocumentService.get.mockResolvedValue(mockDocument);
    mockNotificationSubmissionService.canDeleteDocument.mockResolvedValue(true);

    await controller.delete('fake-uuid', {
      user: {
        entity: {},
      },
    });

    expect(mockNotificationDocumentService.get).toHaveBeenCalledTimes(1);
    expect(mockNotificationDocumentService.delete).toHaveBeenCalledTimes(1);
  });

  it('should call through to update documents', async () => {
    mockNotificationDocumentService.updateDescriptionAndType.mockResolvedValue(
      [],
    );

    await controller.update(
      'file-number',
      {
        user: {
          entity: {},
        },
      },
      [],
    );

    expect(
      mockNotificationDocumentService.updateDescriptionAndType,
    ).toHaveBeenCalledTimes(1);
  });

  it('should call through for open', async () => {
    const fakeUrl = 'fake-url';
    mockNotificationDocumentService.getInlineUrl.mockResolvedValue(fakeUrl);
    mockNotificationDocumentService.get.mockResolvedValue(mockDocument);
    mockNotificationSubmissionService.canAccessDocument.mockResolvedValue(true);

    const res = await controller.open('fake-uuid', {
      user: {
        entity: {},
      },
    });

    expect(res.url).toEqual(fakeUrl);
  });

  it('should call through for download', async () => {
    const fakeUrl = 'fake-url';
    mockNotificationDocumentService.getDownloadUrl.mockResolvedValue(fakeUrl);
    mockNotificationDocumentService.get.mockResolvedValue(mockDocument);
    mockNotificationSubmissionService.canAccessDocument.mockResolvedValue(true);

    const res = await controller.download('fake-uuid', {
      user: {
        entity: {},
      },
    });

    expect(res.url).toEqual(fakeUrl);
  });

  it('should call out to service to attach external document', async () => {
    const user = { user: { entity: 'Bruce' } };
    const fakeUuid = 'fakeUuid';
    const docObj = new Document({ uuid: 'fake-uuid' });
    const userEntity = new User({
      name: user.user.entity,
    });

    const docDto: AttachExternalDocumentDto = {
      fileSize: 0,
      mimeType: 'mimeType',
      fileName: 'fileName',
      fileKey: 'fileKey',
      source: DOCUMENT_SOURCE.APPLICANT,
    };

    mockDocumentService.createDocumentRecord.mockResolvedValue(docObj);

    mockNotificationDocumentService.attachExternalDocument.mockResolvedValue(
      new NotificationDocument({
        notification: undefined,
        type: new DocumentCode(),
        uuid: fakeUuid,
        document: new Document({
          uploadedAt: new Date(),
          uploadedBy: userEntity,
        }),
      }),
    );

    const res = await controller.attachExternalDocument(
      'fake-number',
      docDto,
      user,
    );

    expect(mockDocumentService.createDocumentRecord).toBeCalledTimes(1);
    expect(
      mockNotificationDocumentService.attachExternalDocument,
    ).toBeCalledTimes(1);
    expect(mockDocumentService.createDocumentRecord).toBeCalledWith({
      ...docDto,
      system: DOCUMENT_SYSTEM.PORTAL,
    });
    expect(res.uploadedBy).toEqual(user.user.entity);
    expect(res.uuid).toEqual(fakeUuid);
  });

  it('should should add the public flag when document is a proposal map', async () => {
    const user = { user: { entity: 'Bruce' } };
    const fakeUuid = 'fakeUuid';
    const docObj = new Document({ uuid: 'fake-uuid' });
    const userEntity = new User({
      name: user.user.entity,
    });

    const docDto: AttachExternalDocumentDto = {
      fileSize: 0,
      mimeType: 'mimeType',
      fileName: 'fileName',
      fileKey: 'fileKey',
      source: DOCUMENT_SOURCE.APPLICANT,
      documentType: DOCUMENT_TYPE.PROPOSAL_MAP,
    };

    mockDocumentService.createDocumentRecord.mockResolvedValue(docObj);

    mockNotificationDocumentService.attachExternalDocument.mockResolvedValue(
      new NotificationDocument({
        notification: undefined,
        type: new DocumentCode(),
        uuid: fakeUuid,
        document: new Document({
          uploadedAt: new Date(),
          uploadedBy: userEntity,
        }),
      }),
    );

    const res = await controller.attachExternalDocument(
      'fake-number',
      docDto,
      user,
    );

    expect(mockDocumentService.createDocumentRecord).toBeCalledTimes(1);
    expect(
      mockNotificationDocumentService.attachExternalDocument,
    ).toBeCalledTimes(1);
    expect(
      mockNotificationDocumentService.attachExternalDocument,
    ).toBeCalledWith(
      undefined,
      {
        documentUuid: 'fake-uuid',
        type: DOCUMENT_TYPE.PROPOSAL_MAP,
      },
      [
        VISIBILITY_FLAG.APPLICANT,
        VISIBILITY_FLAG.COMMISSIONER,
        VISIBILITY_FLAG.PUBLIC,
      ],
    );
    expect(mockDocumentService.createDocumentRecord).toBeCalledWith({
      ...docDto,
      system: DOCUMENT_SYSTEM.PORTAL,
    });
    expect(res.uploadedBy).toEqual(user.user.entity);
    expect(res.uuid).toEqual(fakeUuid);
  });
});
