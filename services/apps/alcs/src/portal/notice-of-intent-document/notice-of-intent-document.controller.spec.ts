import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { VISIBILITY_FLAG } from '../../alcs/application/application-document/application-document.entity';
import { NoticeOfIntentDocument } from '../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.entity';
import { NoticeOfIntentDocumentService } from '../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentService } from '../../alcs/notice-of-intent/notice-of-intent.service';
import { NoticeOfIntentProfile } from '../../common/automapper/notice-of-intent.automapper.profile';
import {
  DOCUMENT_TYPE,
  DocumentCode,
} from '../../document/document-code.entity';
import { DOCUMENT_SOURCE, DOCUMENT_SYSTEM } from '../../document/document.dto';
import { Document } from '../../document/document.entity';
import { DocumentService } from '../../document/document.service';
import { User } from '../../user/user.entity';
import { NoticeOfIntentSubmission } from '../notice-of-intent-submission/notice-of-intent-submission.entity';
import { NoticeOfIntentSubmissionService } from '../notice-of-intent-submission/notice-of-intent-submission.service';
import { NoticeOfIntentDocumentController } from './notice-of-intent-document.controller';
import { AttachExternalDocumentDto } from './notice-of-intent-document.dto';

describe('NoticeOfIntentDocumentController', () => {
  let controller: NoticeOfIntentDocumentController;
  let noiDocumentService: DeepMocked<NoticeOfIntentDocumentService>;
  let mockNoiSubmissionService: DeepMocked<NoticeOfIntentSubmissionService>;
  let mockDocumentService: DeepMocked<DocumentService>;
  let mockNoticeOfIntentService: DeepMocked<NoticeOfIntentService>;

  const mockRequest = { user: { entity: 'Bruce' } };

  const mockDocument = new NoticeOfIntentDocument({
    document: new Document({
      fileName: 'fileName',
      uploadedAt: new Date(),
      uploadedBy: new User(),
    }),
  });

  beforeEach(async () => {
    noiDocumentService = createMock();
    mockDocumentService = createMock();
    mockNoiSubmissionService = createMock();
    mockNoticeOfIntentService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [NoticeOfIntentDocumentController],
      providers: [
        NoticeOfIntentProfile,
        {
          provide: NoticeOfIntentDocumentService,
          useValue: noiDocumentService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        {
          provide: NoticeOfIntentSubmissionService,
          useValue: mockNoiSubmissionService,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: NoticeOfIntentService,
          useValue: mockNoticeOfIntentService,
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();
    controller = module.get<NoticeOfIntentDocumentController>(
      NoticeOfIntentDocumentController,
    );

    mockNoiSubmissionService.getByFileNumber.mockResolvedValue(
      new NoticeOfIntentSubmission(),
    );
    mockNoticeOfIntentService.getUuid.mockResolvedValue('uuid');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call through to delete document', async () => {
    noiDocumentService.delete.mockResolvedValue(mockDocument);
    noiDocumentService.get.mockResolvedValue(mockDocument);
    mockNoiSubmissionService.canDeleteDocument.mockResolvedValue(true);

    await controller.delete('fake-uuid', mockRequest);

    expect(noiDocumentService.get).toHaveBeenCalledTimes(1);
    expect(noiDocumentService.delete).toHaveBeenCalledTimes(1);
  });

  it('should call through to update documents', async () => {
    noiDocumentService.updateDescriptionAndType.mockResolvedValue([]);

    await controller.update('file-number', mockRequest, []);

    expect(noiDocumentService.updateDescriptionAndType).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should call through for open', async () => {
    const fakeUrl = 'fake-url';
    noiDocumentService.getInlineUrl.mockResolvedValue(fakeUrl);
    noiDocumentService.get.mockResolvedValue(mockDocument);
    mockNoiSubmissionService.canAccessDocument.mockResolvedValue(true);

    const res = await controller.open('fake-uuid', mockRequest);

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

    noiDocumentService.attachExternalDocument.mockResolvedValue(
      new NoticeOfIntentDocument({
        noticeOfIntent: undefined,
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
    expect(noiDocumentService.attachExternalDocument).toBeCalledTimes(1);
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

    noiDocumentService.attachExternalDocument.mockResolvedValue(
      new NoticeOfIntentDocument({
        noticeOfIntent: undefined,
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
    expect(noiDocumentService.attachExternalDocument).toBeCalledTimes(1);
    expect(noiDocumentService.attachExternalDocument).toBeCalledWith(
      undefined,
      {
        documentUuid: 'fake-uuid',
        type: DOCUMENT_TYPE.PROPOSAL_MAP,
      },
      [
        VISIBILITY_FLAG.APPLICANT,
        VISIBILITY_FLAG.GOVERNMENT,
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

  it('should call through to delete multiple documents', async () => {
    noiDocumentService.deleteMany.mockResolvedValue();
    noiDocumentService.get.mockResolvedValue(new NoticeOfIntentDocument());
    mockNoiSubmissionService.canDeleteDocument.mockResolvedValue(true);

    await controller.deleteMany(['fake-uuid'], mockRequest);

    expect(noiDocumentService.deleteMany).toHaveBeenCalledTimes(1);
  });
});
