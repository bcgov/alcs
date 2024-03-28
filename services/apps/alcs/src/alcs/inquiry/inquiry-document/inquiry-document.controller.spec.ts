import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { InquiryProfile } from '../../../common/automapper/inquiry.automapper.profile';
import { DOCUMENT_TYPE } from '../../../document/document-code.entity';
import { DOCUMENT_SOURCE } from '../../../document/document.dto';
import { Document } from '../../../document/document.entity';
import { User } from '../../../user/user.entity';
import { CodeService } from '../../code/code.service';
import { InquiryDocumentController } from './inquiry-document.controller';
import { InquiryDocument } from './inquiry-document.entity';
import { InquiryDocumentService } from './inquiry-document.service';

describe('InquiryDocumentController', () => {
  let controller: InquiryDocumentController;
  let inquiryDocumentService: DeepMocked<InquiryDocumentService>;

  const mockDocument = new InquiryDocument({
    document: new Document({
      mimeType: 'mimeType',
      uploadedBy: new User(),
      uploadedAt: new Date(),
    }),
  });

  beforeEach(async () => {
    inquiryDocumentService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [InquiryDocumentController],
      providers: [
        {
          provide: CodeService,
          useValue: {},
        },
        InquiryProfile,
        {
          provide: InquiryDocumentService,
          useValue: inquiryDocumentService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();
    controller = module.get<InquiryDocumentController>(
      InquiryDocumentController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return the attached document', async () => {
    const mockFile = {};
    const mockUser = {};

    inquiryDocumentService.attachDocument.mockResolvedValue(mockDocument);

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

    expect(inquiryDocumentService.attachDocument).toHaveBeenCalledTimes(1);
    const callData = inquiryDocumentService.attachDocument.mock.calls[0][0];
    expect(callData.fileName).toEqual('file');
    expect(callData.file).toEqual(mockFile);
    expect(callData.user).toEqual(mockUser);
  });

  it('should throw an exception if request is not the right type', async () => {
    const mockFile = {};
    const mockUser = {};

    inquiryDocumentService.attachDocument.mockResolvedValue(mockDocument);

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
    inquiryDocumentService.list.mockResolvedValue([mockDocument]);

    const res = await controller.listDocuments('fake-number');

    expect(res[0].mimeType).toEqual(mockDocument.document.mimeType);
  });

  it('should call through to delete documents', async () => {
    inquiryDocumentService.delete.mockResolvedValue(mockDocument);
    inquiryDocumentService.get.mockResolvedValue(mockDocument);

    await controller.delete('fake-uuid');

    expect(inquiryDocumentService.get).toHaveBeenCalledTimes(1);
    expect(inquiryDocumentService.delete).toHaveBeenCalledTimes(1);
  });

  it('should call through for open', async () => {
    const fakeUrl = 'fake-url';
    inquiryDocumentService.getInlineUrl.mockResolvedValue(fakeUrl);
    inquiryDocumentService.get.mockResolvedValue(mockDocument);

    const res = await controller.open('fake-uuid');

    expect(res.url).toEqual(fakeUrl);
  });

  it('should call through for download', async () => {
    const fakeUrl = 'fake-url';
    inquiryDocumentService.getDownloadUrl.mockResolvedValue(fakeUrl);
    inquiryDocumentService.get.mockResolvedValue(mockDocument);

    const res = await controller.download('fake-uuid');

    expect(res.url).toEqual(fakeUrl);
  });

  it('should call through for list types', async () => {
    inquiryDocumentService.fetchTypes.mockResolvedValue([]);

    await controller.listTypes();

    expect(inquiryDocumentService.fetchTypes).toHaveBeenCalledTimes(1);
  });
});
