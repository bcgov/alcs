import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../../../../document/document.entity';
import { DocumentService } from '../../../../document/document.service';
import { ApplicationParcelService } from '../application-parcel.service';
import { ApplicationParcelDocument } from './application-parcel-document.entity';
import { ApplicationParcelDocumentService } from './application-parcel-document.service';

describe('ApplicationParcelDocumentService', () => {
  let service: ApplicationParcelDocumentService;
  let mockDocumentService: DeepMocked<DocumentService>;
  let mockRepository: DeepMocked<Repository<ApplicationParcelDocument>>;
  let mockApplicationService: DeepMocked<ApplicationParcelDocument>;
  let mockApplicationParcelService: DeepMocked<ApplicationParcelDocumentService>;

  let mockAppDocument;
  const uuid = '12345';

  beforeEach(async () => {
    mockDocumentService = createMock<DocumentService>();
    mockRepository = createMock<Repository<ApplicationParcelDocument>>();
    mockApplicationParcelService = createMock();

    mockAppDocument = new ApplicationParcelDocument({
      uuid: 'document-uuid',
      document: new Document({
        uuid: 'alcs-document-uuid',
      }),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationParcelDocumentService,
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: ApplicationParcelService,
          useValue: mockApplicationService,
        },
        {
          provide: ApplicationParcelService,
          useValue: mockApplicationParcelService,
        },
        {
          provide: getRepositoryToken(ApplicationParcelDocument),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ApplicationParcelDocumentService>(
      ApplicationParcelDocumentService,
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

    const res = await service.list(uuid, 'certificateOfTitle');

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
    expect(res[0]).toBe(mockAppDocument);
  });

  it('should call through for download', async () => {
    const mockAppDocument = new ApplicationParcelDocument({
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
});
