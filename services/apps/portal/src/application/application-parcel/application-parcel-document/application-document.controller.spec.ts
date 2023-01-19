import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { DeepMocked, createMock } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { of } from 'rxjs';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { AlcsDocumentService } from '../../../alcs/document-grpc/alcs-document.service';
import { ApplicationProfile } from '../../../common/automapper/application.automapper.profile';
import { Document } from '../../../document/document.entity';
import { User } from '../../../user/user.entity';
import { ApplicationParcelService } from '../application-parcel.service';

import { ApplicationParcelDocumentController } from './application-parcel-document.controller';
import { AttachExternalDocumentDto } from './application-parcel-document.dto';
import { ApplicationParcelDocument } from './application-parcel-document.entity';
import { ApplicationParcelDocumentService } from './application-parcel-document.service';

describe('ApplicationDocumentController', () => {
  let controller: ApplicationParcelDocumentController;
  let appDocumentService: DeepMocked<ApplicationParcelDocumentService>;
  let mockApplicationService: DeepMocked<ApplicationParcelService>;
  let mockAlcsDocumentService: DeepMocked<AlcsDocumentService>;

  const mockDocument = new ApplicationParcelDocument({
    document: new Document({
      uploadedBy: new User(),
    }),
  });

  beforeEach(async () => {
    appDocumentService = createMock();
    mockAlcsDocumentService = createMock();
    mockApplicationService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationParcelDocumentController],
      providers: [
        ApplicationProfile,
        {
          provide: ApplicationParcelDocumentService,
          useValue: appDocumentService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        {
          provide: ApplicationParcelService,
          useValue: mockApplicationService,
        },
        {
          provide: AlcsDocumentService,
          useValue: mockAlcsDocumentService,
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();
    controller = module.get<ApplicationParcelDocumentController>(
      ApplicationParcelDocumentController,
    );

    // mockApplicationService.verifyAccess.mockResolvedValue(new Application());
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list documents', async () => {
    appDocumentService.list.mockResolvedValue([mockDocument]);

    const res = await controller.listDocuments(
      'fake-number',
      'certificateOfTitle',
      // {
      //   user: {
      //     entity: {},
      //   },
      // },
    );

    //expect(res[0].mimeType).toEqual(mockDocument.document.mimeType);
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

  it('should call through for download', async () => {
    const fakeUrl = 'fake-url';
    appDocumentService.getInlineUrl.mockResolvedValue({
      url: fakeUrl,
    });
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
    const docObj = { alcsDocumentUuid: 'fake-uuid' };
    const docDto = {
      mimeType: 'mimeType',
      fileName: 'fileName',
      fileKey: 'fileKey',
      source: 'Applicant',
      documentType: 'certificateOfTitle',
    };

    mockAlcsDocumentService.createExternalDocument.mockReturnValue(of(docObj));

    appDocumentService.createRecord.mockResolvedValue(
      new ApplicationParcelDocument({
        applicationParcel: undefined,
        applicationParcelUuid: '',
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
      docDto as AttachExternalDocumentDto,
      user,
    );

    expect(mockAlcsDocumentService.createExternalDocument).toBeCalledTimes(1);
    expect(appDocumentService.createRecord).toBeCalledTimes(1);
    expect(mockAlcsDocumentService.createExternalDocument).toBeCalledWith(
      docDto,
    );
    expect(res.uploadedBy).toEqual(user.user.entity);
    expect(res.uuid).toEqual(fakeUuid);
  });
});
