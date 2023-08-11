import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { NoticeOfIntentProfile } from '../../../common/automapper/notice-of-intent.automapper.profile';
import { DOCUMENT_TYPE } from '../../../document/document-code.entity';
import { DOCUMENT_SOURCE } from '../../../document/document.dto';
import { Document } from '../../../document/document.entity';
import { ApplicationOwnerService } from '../../../portal/application-submission/application-owner/application-owner.service';
import { ApplicationParcelService } from '../../../portal/application-submission/application-parcel/application-parcel.service';
import { User } from '../../../user/user.entity';
import { CodeService } from '../../code/code.service';
import { NoticeOfIntentDocumentController } from './notice-of-intent-document.controller';
import { NoticeOfIntentDocument } from './notice-of-intent-document.entity';
import { NoticeOfIntentDocumentService } from './notice-of-intent-document.service';

describe('NoticeOfIntentDocumentController', () => {
  let controller: NoticeOfIntentDocumentController;
  let appDocumentService: DeepMocked<NoticeOfIntentDocumentService>;
  let mockParcelService: DeepMocked<ApplicationParcelService>;
  let mockOwnerService: DeepMocked<ApplicationOwnerService>;

  const mockDocument = new NoticeOfIntentDocument({
    document: new Document({
      mimeType: 'mimeType',
      uploadedBy: new User(),
      uploadedAt: new Date(),
    }),
  });

  beforeEach(async () => {
    appDocumentService = createMock();
    mockParcelService = createMock();
    mockOwnerService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [NoticeOfIntentDocumentController],
      providers: [
        {
          provide: CodeService,
          useValue: {},
        },
        NoticeOfIntentProfile,
        {
          provide: NoticeOfIntentDocumentService,
          useValue: appDocumentService,
        },
        {
          provide: ApplicationParcelService,
          useValue: mockParcelService,
        },
        {
          provide: ApplicationOwnerService,
          useValue: mockOwnerService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();
    controller = module.get<NoticeOfIntentDocumentController>(
      NoticeOfIntentDocumentController,
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

  it('should call through for open', async () => {
    const fakeUrl = 'fake-url';
    appDocumentService.getInlineUrl.mockResolvedValue(fakeUrl);
    appDocumentService.get.mockResolvedValue(mockDocument);

    const res = await controller.open('fake-uuid');

    expect(res.url).toEqual(fakeUrl);
  });

  it('should call through for download', async () => {
    const fakeUrl = 'fake-url';
    appDocumentService.getDownloadUrl.mockResolvedValue(fakeUrl);
    appDocumentService.get.mockResolvedValue(mockDocument);

    const res = await controller.download('fake-uuid');

    expect(res.url).toEqual(fakeUrl);
  });

  it('should call through for list types', async () => {
    appDocumentService.fetchTypes.mockResolvedValue([]);

    const res = await controller.listTypes();

    expect(appDocumentService.fetchTypes).toHaveBeenCalledTimes(1);
  });

  it('should call through for list app documents', async () => {
    appDocumentService.getApplicantDocuments.mockResolvedValue([]);

    const res = await controller.listApplicantDocuments('');

    expect(appDocumentService.getApplicantDocuments).toHaveBeenCalledTimes(1);
  });

  it('should call through for list review documents', async () => {
    appDocumentService.list.mockResolvedValue([]);

    const res = await controller.listReviewDocuments('');

    expect(appDocumentService.list).toHaveBeenCalledTimes(1);
  });

  // Re-enable as part of adding step 1
  // it('should set the certificate of title on the supplied parcel', async () => {
  //   const mockFile = {};
  //   const mockUser = {};
  //
  //   appDocumentService.attachDocument.mockResolvedValue(
  //     new NoticeOfIntentDocument({
  //       ...mockDocument,
  //       typeCode: DOCUMENT_TYPE.CERTIFICATE_OF_TITLE,
  //     }),
  //   );
  //   mockParcelService.getOneOrFail.mockResolvedValue(new ApplicationParcel());
  //   mockParcelService.setCertificateOfTitle.mockResolvedValue(
  //     new ApplicationParcel(),
  //   );
  //
  //   const res = await controller.attachDocument('fileNumber', {
  //     isMultipart: () => true,
  //     body: {
  //       documentType: {
  //         value: DOCUMENT_TYPE.CERTIFICATE_OF_TITLE,
  //       },
  //       fileName: {
  //         value: 'file',
  //       },
  //       source: {
  //         value: DOCUMENT_SOURCE.APPLICANT,
  //       },
  //       visibilityFlags: {
  //         value: '',
  //       },
  //       parcelUuid: {
  //         value: 'parcel-uuid',
  //       },
  //       file: mockFile,
  //     },
  //     user: {
  //       entity: mockUser,
  //     },
  //   });
  //
  //   expect(res.mimeType).toEqual(mockDocument.document.mimeType);
  //
  //   expect(appDocumentService.attachDocument).toHaveBeenCalledTimes(1);
  //   const callData = appDocumentService.attachDocument.mock.calls[0][0];
  //   expect(callData.fileName).toEqual('file');
  //   expect(callData.file).toEqual(mockFile);
  //   expect(callData.user).toEqual(mockUser);
  //   expect(mockParcelService.getOneOrFail).toHaveBeenCalledTimes(1);
  //   expect(mockParcelService.setCertificateOfTitle).toHaveBeenCalledTimes(1);
  // });

  // TODO: Re-enable as part of adding Step 1
  // it('should set the corporate summary on the supplied owner', async () => {
  //   const mockFile = {};
  //   const mockUser = {};
  //
  //   appDocumentService.attachDocument.mockResolvedValue(
  //     new NoticeOfIntentDocument({
  //       ...mockDocument,
  //       typeCode: DOCUMENT_TYPE.CORPORATE_SUMMARY,
  //     }),
  //   );
  //   mockOwnerService.getOwner.mockResolvedValue(new ApplicationOwner());
  //   mockOwnerService.save.mockResolvedValue();
  //
  //   const res = await controller.attachDocument('fileNumber', {
  //     isMultipart: () => true,
  //     body: {
  //       documentType: {
  //         value: DOCUMENT_TYPE.CORPORATE_SUMMARY,
  //       },
  //       fileName: {
  //         value: 'file',
  //       },
  //       source: {
  //         value: DOCUMENT_SOURCE.APPLICANT,
  //       },
  //       visibilityFlags: {
  //         value: '',
  //       },
  //       ownerUuid: {
  //         value: 'parcel-uuid',
  //       },
  //       file: mockFile,
  //     },
  //     user: {
  //       entity: mockUser,
  //     },
  //   });
  //
  //   expect(res.mimeType).toEqual(mockDocument.document.mimeType);
  //
  //   expect(appDocumentService.attachDocument).toHaveBeenCalledTimes(1);
  //   const callData = appDocumentService.attachDocument.mock.calls[0][0];
  //   expect(callData.fileName).toEqual('file');
  //   expect(callData.file).toEqual(mockFile);
  //   expect(callData.user).toEqual(mockUser);
  //   expect(mockOwnerService.getOwner).toHaveBeenCalledTimes(1);
  //   expect(mockOwnerService.save).toHaveBeenCalledTimes(1);
  // });
});
