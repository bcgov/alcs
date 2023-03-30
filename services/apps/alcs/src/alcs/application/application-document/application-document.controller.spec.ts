import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { ApplicationProfile } from '../../../common/automapper/application.automapper.profile';
import { DOCUMENT_SOURCE } from '../../../document/document.dto';
import { CodeService } from '../../code/code.service';
import {
  DOCUMENT_TYPE,
  DOCUMENT_TYPES,
} from './application-document-code.entity';
import { ApplicationDocumentController } from './application-document.controller';
import { ApplicationDocument } from './application-document.entity';
import { ApplicationDocumentService } from './application-document.service';

describe('ApplicationDocumentController', () => {
  let controller: ApplicationDocumentController;
  let appDocumentService: DeepMocked<ApplicationDocumentService>;

  const mockDocument = {
    document: {
      mimeType: 'mimeType',
      uploadedBy: {},
      uploadedAt: new Date(),
    },
  } as ApplicationDocument;

  beforeEach(async () => {
    appDocumentService = createMock<ApplicationDocumentService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationDocumentController],
      providers: [
        {
          provide: CodeService,
          useValue: {},
        },
        ApplicationProfile,
        {
          provide: ApplicationDocumentService,
          useValue: appDocumentService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();
    controller = module.get<ApplicationDocumentController>(
      ApplicationDocumentController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return the attached document', async () => {
    const mockFile = {};
    const mockUser = {};

    appDocumentService.attachDocument.mockResolvedValue(mockDocument);

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

    expect(appDocumentService.attachDocument).toHaveBeenCalledTimes(1);
    const callData = appDocumentService.attachDocument.mock.calls[0][0];
    expect(callData.fileName).toEqual('file');
    expect(callData.file).toEqual(mockFile);
    expect(callData.user).toEqual(mockUser);
  });

  it('should throw an exception if request is not the right type', async () => {
    const mockFile = {};
    const mockUser = {};

    appDocumentService.attachDocument.mockResolvedValue(mockDocument);

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

  it('should throw an exception if pass an invalid document type', async () => {
    const mockFile = {};
    const mockUser = {};

    appDocumentService.attachDocument.mockResolvedValue(mockDocument);

    await expect(
      controller.attachDocument('fileNumber', {
        isMultipart: () => true,
        body: {
          documentType: {
            value: 'BAD TYPE',
          },
        },
        file: () => mockFile,
        user: {
          entity: mockUser,
        },
      }),
    ).rejects.toMatchObject(
      new BadRequestException(
        `Invalid document type specified, must be one of ${DOCUMENT_TYPES.join(
          ', ',
        )}`,
      ),
    );
  });

  it('should list documents', async () => {
    appDocumentService.list.mockResolvedValue([mockDocument]);

    const res = await controller.listDocuments(
      'fake-number',
      DOCUMENT_TYPE.DECISION_DOCUMENT,
    );

    expect(res[0].mimeType).toEqual(mockDocument.document.mimeType);
  });

  it('should call through to delete documents', async () => {
    appDocumentService.delete.mockResolvedValue(mockDocument);
    appDocumentService.get.mockResolvedValue(mockDocument);

    await controller.delete('fake-uuid');

    expect(appDocumentService.get).toHaveBeenCalledTimes(1);
    expect(appDocumentService.delete).toHaveBeenCalledTimes(1);
  });

  it('should call through for download', async () => {
    const fakeUrl = 'fake-url';
    appDocumentService.getInlineUrl.mockResolvedValue(fakeUrl);
    appDocumentService.get.mockResolvedValue(mockDocument);

    const res = await controller.open('fake-uuid');

    expect(res.url).toEqual(fakeUrl);
  });
});
