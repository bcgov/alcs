import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../../test/mocks/mockTypes';
import { ApplicationParcelProfile } from '../../../../common/automapper/application-parcel.automapper.profile';
import { DocumentService } from '../../../../document/document.service';
import { User } from '../../../../user/user.entity';
import { ApplicationSubmission } from '../../application-submission.entity';
import { ApplicationSubmissionService } from '../../application-submission.service';
import { ApplicationParcel } from '../application-parcel.entity';
import { ApplicationParcelService } from '../application-parcel.service';
import { ApplicationParcelDocumentController } from './application-parcel-document.controller';
import { AttachExternalDocumentDto } from './application-parcel-document.dto';
import { ApplicationParcelDocument } from './application-parcel-document.entity';
import { ApplicationParcelDocumentService } from './application-parcel-document.service';
import { Document } from '../../../../document/document.entity';

describe('ApplicationParcelDocumentController', () => {
  let controller: ApplicationParcelDocumentController;
  let mockAppParcelDocumentService: DeepMocked<ApplicationParcelDocumentService>;
  let mockApplicationParcelService: DeepMocked<ApplicationParcelService>;
  let mockDocumentService: DeepMocked<DocumentService>;
  let mockApplicationService: DeepMocked<ApplicationSubmissionService>;

  const mockDocument = new ApplicationParcelDocument({
    document: new Document({
      uploadedBy: new User(),
    }),
    applicationParcel: new ApplicationParcel({
      applicationFileNumber: 'fake-number',
    }),
  });

  beforeEach(async () => {
    mockAppParcelDocumentService = createMock();
    mockDocumentService = createMock();
    mockApplicationParcelService = createMock();
    mockApplicationService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationParcelDocumentController],
      providers: [
        ApplicationParcelProfile,
        {
          provide: ApplicationParcelDocumentService,
          useValue: mockAppParcelDocumentService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        {
          provide: ApplicationParcelService,
          useValue: mockApplicationParcelService,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: ApplicationSubmissionService,
          useValue: mockApplicationService,
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();
    controller = module.get<ApplicationParcelDocumentController>(
      ApplicationParcelDocumentController,
    );

    mockApplicationService.verifyAccess.mockResolvedValue(
      new ApplicationSubmission(),
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list documents', async () => {
    mockAppParcelDocumentService.list.mockResolvedValue([mockDocument]);

    const res = await controller.listDocuments(
      'fake-number',
      'certificateOfTitle',
      {
        user: {
          entity: {},
        },
      },
    );

    expect(mockApplicationService.verifyAccess).toHaveBeenCalledTimes(1);
    expect(mockAppParcelDocumentService.list).toHaveBeenCalledTimes(1);
  });

  it('should call through to delete documents', async () => {
    mockAppParcelDocumentService.delete.mockResolvedValue();
    mockAppParcelDocumentService.get.mockResolvedValue(mockDocument);

    await controller.delete('fake-uuid', {
      user: {
        entity: {},
      },
    });

    expect(mockAppParcelDocumentService.get).toHaveBeenCalledTimes(1);
    expect(mockAppParcelDocumentService.delete).toHaveBeenCalledTimes(1);
    expect(mockApplicationService.verifyAccess).toHaveBeenCalledTimes(1);
  });

  it('should call through for download', async () => {
    const fakeUrl = 'fake-url';
    mockAppParcelDocumentService.getInlineUrl.mockResolvedValue(fakeUrl);
    mockAppParcelDocumentService.get.mockResolvedValue(mockDocument);

    const res = await controller.open('fake-uuid', {
      user: {
        entity: {},
      },
    });

    expect(res).toEqual(fakeUrl);
    expect(mockApplicationService.verifyAccess).toHaveBeenCalledTimes(1);
  });

  it('should call out to service to attach external document', async () => {
    const user = { user: { entity: 'Bruce' } };
    const fakeUuid = 'fakeUuid';
    const docObj = new Document({ uuid: 'fake-uuid' });
    const docDto: AttachExternalDocumentDto = {
      mimeType: 'mimeType',
      fileName: 'fileName',
      fileKey: 'fileKey',
      source: 'Applicant',
      documentType: 'certificateOfTitle',
      fileSize: 0,
    };

    mockDocumentService.createDocumentRecord.mockResolvedValue(docObj);
    mockApplicationParcelService.getOneOrFail.mockResolvedValue(
      new ApplicationParcel({
        applicationFileNumber: 'fake',
      }),
    );

    mockAppParcelDocumentService.createRecord.mockResolvedValue(
      new ApplicationParcelDocument({
        applicationParcel: new ApplicationParcel({
          applicationFileNumber: 'fake',
        }),
        applicationParcelUuid: 'fake_uuid',
        type: 'fakeType',
        uuid: fakeUuid,
        document: new Document({
          uploadedBy: new User({
            name: user.user.entity,
          }),
        }),
      }),
    );

    const res = await controller.attachExternalDocument(
      'fake-number',
      docDto,
      user,
    );

    expect(mockDocumentService.createDocumentRecord).toBeCalledTimes(1);
    expect(mockAppParcelDocumentService.createRecord).toBeCalledTimes(1);
    expect(mockDocumentService.createDocumentRecord).toBeCalledWith({
      ...docDto,
      uploadedBy: user.user.entity,
    });
    expect(res.uploadedBy).toEqual(user.user.entity);
    expect(res.uuid).toEqual(fakeUuid);
    expect(mockApplicationService.verifyAccess).toHaveBeenCalledTimes(1);
  });
});
