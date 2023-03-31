import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import {
  ApplicationDocumentCode,
  DOCUMENT_TYPE,
} from '../../alcs/application/application-document/application-document-code.entity';
import { ApplicationDocument } from '../../alcs/application/application-document/application-document.entity';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { ApplicationService } from '../../alcs/application/application.service';
import { ApplicationProfile } from '../../common/automapper/application.automapper.profile';
import { DOCUMENT_SOURCE } from '../../document/document.dto';
import { Document } from '../../document/document.entity';
import { DocumentService } from '../../document/document.service';
import { User } from '../../user/user.entity';
import { ApplicationSubmission } from '../application-submission/application-submission.entity';
import { ApplicationSubmissionService } from '../application-submission/application-submission.service';
import { ApplicationDocumentController } from './application-document.controller';
import { AttachExternalDocumentDto } from './application-document.dto';

describe('ApplicationDocumentController', () => {
  let controller: ApplicationDocumentController;
  let appDocumentService: DeepMocked<ApplicationDocumentService>;
  let mockApplicationSubmissionService: DeepMocked<ApplicationSubmissionService>;
  let mockDocumentService: DeepMocked<DocumentService>;
  let mockApplicationService: DeepMocked<ApplicationService>;

  const mockDocument = new ApplicationDocument({
    document: new Document({
      fileName: 'fileName',
      uploadedAt: new Date(),
      uploadedBy: new User(),
    }),
  });

  beforeEach(async () => {
    appDocumentService = createMock();
    mockDocumentService = createMock();
    mockApplicationSubmissionService = createMock();
    mockApplicationService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationDocumentController],
      providers: [
        ApplicationProfile,
        {
          provide: ApplicationDocumentService,
          useValue: appDocumentService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        {
          provide: ApplicationSubmissionService,
          useValue: mockApplicationSubmissionService,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();
    controller = module.get<ApplicationDocumentController>(
      ApplicationDocumentController,
    );

    mockApplicationSubmissionService.verifyAccess.mockResolvedValue(
      new ApplicationSubmission(),
    );
    mockApplicationService.getUuid.mockResolvedValue('uuid');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list documents', async () => {
    appDocumentService.list.mockResolvedValue([mockDocument]);

    const res = await controller.listDocumentsByType(
      'fake-number',
      DOCUMENT_TYPE.CERTIFICATE_OF_TITLE,
      {
        user: {
          entity: {},
        },
      },
    );

    expect(res[0].fileName).toEqual(mockDocument.document.fileName);
    expect(appDocumentService.list).toHaveBeenCalledTimes(1);
  });

  it('should call through to delete documents', async () => {
    appDocumentService.delete.mockResolvedValue(mockDocument);
    appDocumentService.get.mockResolvedValue(mockDocument);

    await controller.delete('fake-uuid', {
      user: {
        entity: {},
      },
    });

    expect(appDocumentService.get).toHaveBeenCalledTimes(1);
    expect(appDocumentService.delete).toHaveBeenCalledTimes(1);
  });

  it('should call through to update documents', async () => {
    appDocumentService.updateDescriptionAndType.mockResolvedValue([]);

    await controller.update(
      'file-number',
      {
        user: {
          entity: {},
        },
      },
      [],
    );

    expect(appDocumentService.updateDescriptionAndType).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should call through for download', async () => {
    const fakeUrl = 'fake-url';
    appDocumentService.getInlineUrl.mockResolvedValue(fakeUrl);
    appDocumentService.get.mockResolvedValue(mockDocument);

    const res = await controller.open('fake-uuid', {
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

    appDocumentService.attachExternalDocument.mockResolvedValue(
      new ApplicationDocument({
        application: undefined,
        type: new ApplicationDocumentCode(),
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
    expect(appDocumentService.attachExternalDocument).toBeCalledTimes(1);
    expect(mockDocumentService.createDocumentRecord).toBeCalledWith(docDto);
    expect(res.uploadedBy).toEqual(user.user.entity);
    expect(res.uuid).toEqual(fakeUuid);
  });
});
