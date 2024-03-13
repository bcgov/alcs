import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { PlanningReviewProfile } from '../../../common/automapper/planning-review.automapper.profile';
import { DOCUMENT_TYPE } from '../../../document/document-code.entity';
import { DOCUMENT_SOURCE } from '../../../document/document.dto';
import { Document } from '../../../document/document.entity';
import { User } from '../../../user/user.entity';
import { CodeService } from '../../code/code.service';
import { PlanningReviewDocumentController } from './planning-review-document.controller';
import { PlanningReviewDocument } from './planning-review-document.entity';
import { PlanningReviewDocumentService } from './planning-review-document.service';

describe('PlanningReviewDocumentController', () => {
  let controller: PlanningReviewDocumentController;
  let mockPlanningReviewDocumentService: DeepMocked<PlanningReviewDocumentService>;

  const mockDocument = new PlanningReviewDocument({
    document: new Document({
      mimeType: 'mimeType',
      uploadedBy: new User(),
      uploadedAt: new Date(),
    }),
  });

  beforeEach(async () => {
    mockPlanningReviewDocumentService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [PlanningReviewDocumentController],
      providers: [
        {
          provide: CodeService,
          useValue: {},
        },
        PlanningReviewProfile,
        {
          provide: PlanningReviewDocumentService,
          useValue: mockPlanningReviewDocumentService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();
    controller = module.get<PlanningReviewDocumentController>(
      PlanningReviewDocumentController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return the attached document', async () => {
    const mockFile = {};
    const mockUser = {};

    mockPlanningReviewDocumentService.attachDocument.mockResolvedValue(
      mockDocument,
    );

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

    expect(
      mockPlanningReviewDocumentService.attachDocument,
    ).toHaveBeenCalledTimes(1);
    const callData =
      mockPlanningReviewDocumentService.attachDocument.mock.calls[0][0];
    expect(callData.fileName).toEqual('file');
    expect(callData.file).toEqual(mockFile);
    expect(callData.user).toEqual(mockUser);
  });

  it('should throw an exception if request is not the right type', async () => {
    const mockFile = {};
    const mockUser = {};

    mockPlanningReviewDocumentService.attachDocument.mockResolvedValue(
      mockDocument,
    );

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
    mockPlanningReviewDocumentService.list.mockResolvedValue([mockDocument]);

    const res = await controller.listDocuments(
      'fake-number',
      DOCUMENT_TYPE.DECISION_DOCUMENT,
    );

    expect(res[0].mimeType).toEqual(mockDocument.document.mimeType);
  });

  it('should call through to delete documents', async () => {
    mockPlanningReviewDocumentService.delete.mockResolvedValue(mockDocument);
    mockPlanningReviewDocumentService.get.mockResolvedValue(mockDocument);

    await controller.delete('fake-uuid');

    expect(mockPlanningReviewDocumentService.get).toHaveBeenCalledTimes(1);
    expect(mockPlanningReviewDocumentService.delete).toHaveBeenCalledTimes(1);
  });

  it('should call through for open', async () => {
    const fakeUrl = 'fake-url';
    mockPlanningReviewDocumentService.getInlineUrl.mockResolvedValue(fakeUrl);
    mockPlanningReviewDocumentService.get.mockResolvedValue(mockDocument);

    const res = await controller.open('fake-uuid');

    expect(res.url).toEqual(fakeUrl);
  });

  it('should call through for download', async () => {
    const fakeUrl = 'fake-url';
    mockPlanningReviewDocumentService.getDownloadUrl.mockResolvedValue(fakeUrl);
    mockPlanningReviewDocumentService.get.mockResolvedValue(mockDocument);

    const res = await controller.download('fake-uuid');

    expect(res.url).toEqual(fakeUrl);
  });

  it('should call through for list types', async () => {
    mockPlanningReviewDocumentService.fetchTypes.mockResolvedValue([]);

    const res = await controller.listTypes();

    expect(mockPlanningReviewDocumentService.fetchTypes).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should call through for setting sort', async () => {
    mockPlanningReviewDocumentService.setSorting.mockResolvedValue();

    await controller.sortDocuments([]);

    expect(mockPlanningReviewDocumentService.setSorting).toHaveBeenCalledTimes(
      1,
    );
  });
});
