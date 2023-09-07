import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { NotificationProfile } from '../../../common/automapper/notification.automapper.profile';
import { DOCUMENT_TYPE } from '../../../document/document-code.entity';
import { DOCUMENT_SOURCE } from '../../../document/document.dto';
import { Document } from '../../../document/document.entity';
import { User } from '../../../user/user.entity';
import { CodeService } from '../../code/code.service';
import { NotificationDocumentController } from './notification-document.controller';
import { NotificationDocument } from './notification-document.entity';
import { NotificationDocumentService } from './notification-document.service';

describe('NotificationDocumentController', () => {
  let controller: NotificationDocumentController;
  let notificationDocumentService: DeepMocked<NotificationDocumentService>;

  const mockDocument = new NotificationDocument({
    document: new Document({
      mimeType: 'mimeType',
      uploadedBy: new User(),
      uploadedAt: new Date(),
    }),
  });

  beforeEach(async () => {
    notificationDocumentService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [NotificationDocumentController],
      providers: [
        {
          provide: CodeService,
          useValue: {},
        },
        NotificationProfile,
        {
          provide: NotificationDocumentService,
          useValue: notificationDocumentService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();
    controller = module.get<NotificationDocumentController>(
      NotificationDocumentController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return the attached document', async () => {
    const mockFile = {};
    const mockUser = {};

    notificationDocumentService.attachDocument.mockResolvedValue(mockDocument);

    const res = await controller.attachDocument('fileNumber', {
      isMultipart: () => true,
      body: {
        documentType: {
          value: DOCUMENT_TYPE.CERTIFICATE_OF_TITLE,
        },
        fileName: {
          value: 'file',
        },
        source: {
          value: DOCUMENT_SOURCE.APPLICANT,
        },
        visibilityFlags: {
          value: '',
        },
        file: mockFile,
      },
      user: {
        entity: mockUser,
      },
    });

    expect(res.mimeType).toEqual(mockDocument.document.mimeType);

    expect(notificationDocumentService.attachDocument).toHaveBeenCalledTimes(1);
    const callData =
      notificationDocumentService.attachDocument.mock.calls[0][0];
    expect(callData.fileName).toEqual('file');
    expect(callData.file).toEqual(mockFile);
    expect(callData.user).toEqual(mockUser);
  });

  it('should throw an exception if request is not the right type', async () => {
    const mockFile = {};
    const mockUser = {};

    notificationDocumentService.attachDocument.mockResolvedValue(mockDocument);

    await expect(
      controller.attachDocument('fileNumber', {
        isMultipart: () => false,
        file: () => mockFile,
        user: {
          entity: mockUser,
        },
      }),
    ).rejects.toMatchObject(
      new BadRequestException('Request is not multipart'),
    );
  });

  it('should list documents', async () => {
    notificationDocumentService.list.mockResolvedValue([mockDocument]);

    const res = await controller.listDocuments(
      'fake-number',
      DOCUMENT_TYPE.DECISION_DOCUMENT,
    );

    expect(res[0].mimeType).toEqual(mockDocument.document.mimeType);
  });

  it('should call through to delete documents', async () => {
    notificationDocumentService.delete.mockResolvedValue(mockDocument);
    notificationDocumentService.get.mockResolvedValue(mockDocument);

    await controller.delete('fake-uuid');

    expect(notificationDocumentService.get).toHaveBeenCalledTimes(1);
    expect(notificationDocumentService.delete).toHaveBeenCalledTimes(1);
  });

  it('should call through for open', async () => {
    const fakeUrl = 'fake-url';
    notificationDocumentService.getInlineUrl.mockResolvedValue(fakeUrl);
    notificationDocumentService.get.mockResolvedValue(mockDocument);

    const res = await controller.open('fake-uuid');

    expect(res.url).toEqual(fakeUrl);
  });

  it('should call through for download', async () => {
    const fakeUrl = 'fake-url';
    notificationDocumentService.getDownloadUrl.mockResolvedValue(fakeUrl);
    notificationDocumentService.get.mockResolvedValue(mockDocument);

    const res = await controller.download('fake-uuid');

    expect(res.url).toEqual(fakeUrl);
  });

  it('should call through for list types', async () => {
    notificationDocumentService.fetchTypes.mockResolvedValue([]);

    const res = await controller.listTypes();

    expect(notificationDocumentService.fetchTypes).toHaveBeenCalledTimes(1);
  });

  it('should call through for list app documents', async () => {
    notificationDocumentService.getApplicantDocuments.mockResolvedValue([]);

    const res = await controller.listApplicantDocuments('');

    expect(
      notificationDocumentService.getApplicantDocuments,
    ).toHaveBeenCalledTimes(1);
  });

  it('should call through for list review documents', async () => {
    notificationDocumentService.list.mockResolvedValue([]);

    const res = await controller.listReviewDocuments('');

    expect(notificationDocumentService.list).toHaveBeenCalledTimes(1);
  });
});
