import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { of } from 'rxjs';
import { Repository } from 'typeorm';
import {
  ApplicationDocument,
  DOCUMENT_TYPE,
} from '../../../alcs/application/application-document/application-document.entity';
import { DocumentService } from '../../../document/document.service';
import { ApplicationProposal } from '../application-proposal.entity';
import { ApplicationProposalService } from '../application-proposal.service';
import { ApplicationDocumentService } from './application-document.service';
import { Document } from '../../../document/document.entity';

describe('ApplicationDocumentService', () => {
  let service: ApplicationDocumentService;
  let mockDocumentService: DeepMocked<DocumentService>;
  let mockApplicationService: DeepMocked<ApplicationProposalService>;
  let mockRepository: DeepMocked<Repository<ApplicationDocument>>;

  let mockApplication;
  let mockAppDocument;
  const fileNumber = '12345';

  beforeEach(async () => {
    mockDocumentService = createMock<DocumentService>();
    mockApplicationService = createMock<ApplicationProposalService>();
    mockRepository = createMock<Repository<ApplicationDocument>>();

    mockApplication = new ApplicationProposal({
      fileNumber,
    });
    mockApplicationService.getOrFail.mockResolvedValue(mockApplication);
    mockApplicationService.getIfCreator.mockResolvedValue(mockApplication);

    mockAppDocument = new ApplicationDocument({
      uuid: 'document-uuid',
      document: new Document({
        uuid: 'alcs-document-uuid',
      }),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationDocumentService,
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: ApplicationProposalService,
          useValue: mockApplicationService,
        },
        {
          provide: getRepositoryToken(ApplicationDocument),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ApplicationDocumentService>(
      ApplicationDocumentService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call through when deleting a document', async () => {
    mockDocumentService.softRemove.mockResolvedValue();

    await service.delete(mockAppDocument);

    expect(mockDocumentService.softRemove).toHaveBeenCalledTimes(1);
    expect(mockDocumentService.softRemove.mock.calls[0][0]).toBe(
      mockAppDocument.document,
    );
  });

  it('should call through for get', async () => {
    mockRepository.findOne.mockResolvedValue(mockAppDocument);

    const res = await service.get('fake-uuid');
    expect(res).toBe(mockAppDocument);
  });

  it("should throw an exception when getting a document that doesn't exist", async () => {
    mockRepository.findOne.mockResolvedValue(null);

    await expect(service.get(mockAppDocument.uuid)).rejects.toMatchObject(
      new ServiceNotFoundException(
        `Failed to find document ${mockAppDocument.uuid}`,
      ),
    );
  });

  it('should call through for list', async () => {
    mockRepository.find.mockResolvedValue([mockAppDocument]);

    const res = await service.list(
      fileNumber,
      DOCUMENT_TYPE.CERTIFICATE_OF_TITLE,
    );

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
    expect(res[0]).toBe(mockAppDocument);
  });

  it('should call through for listAll', async () => {
    const mockAppDocument = new ApplicationDocument();
    mockRepository.find.mockResolvedValue([mockAppDocument]);

    const res = await service.listAll(
      [fileNumber],
      DOCUMENT_TYPE.CERTIFICATE_OF_TITLE,
    );

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
    expect(res[0]).toBe(mockAppDocument);
  });

  it('should call through for download', async () => {
    const mockAppDocument = new ApplicationDocument({
      document: new Document({
        uuid: 'document-id',
      }),
    });

    const fakeUrl = 'mock-url';
    mockDocumentService.getDownloadUrl.mockResolvedValue(fakeUrl);

    const res = await service.getInlineUrl(mockAppDocument);

    expect(mockDocumentService.getDownloadUrl).toHaveBeenCalledTimes(1);
    expect(res).toEqual(fakeUrl);
  });

  it('should load and save each document in an update', async () => {
    const mockAppDocument = new ApplicationDocument({
      document: new Document({
        uuid: 'document-id',
      }),
    });
    mockRepository.findOne.mockResolvedValue(mockAppDocument);
    mockRepository.save.mockResolvedValue(mockAppDocument);

    await service.update(
      [
        {
          uuid: '',
          type: DOCUMENT_TYPE.OTHER,
          description: '',
        },
        {
          uuid: '',
          type: DOCUMENT_TYPE.OTHER,
          description: '',
        },
      ],
      '',
    );

    expect(mockRepository.findOne).toHaveBeenCalledTimes(2);
    expect(mockRepository.save).toHaveBeenCalledTimes(2);
  });

  it('should call through for delete by type', async () => {
    const mockAppDocument = new ApplicationDocument({
      document: new Document({
        uuid: 'document-id',
      }),
    });
    mockRepository.find.mockResolvedValue([mockAppDocument, mockAppDocument]);
    mockDocumentService.softRemove.mockResolvedValue({} as any);

    await service.deleteByType(DOCUMENT_TYPE.RESOLUTION_DOCUMENT, '');

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
    expect(mockDocumentService.softRemove).toHaveBeenCalledTimes(2);
  });
});
