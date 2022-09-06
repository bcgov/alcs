import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { ApplicationProfile } from '../../common/automapper/application.automapper.profile';
import { ServiceNotFoundException } from '../../common/exceptions/base.exception';
import { mockKeyCloakProviders } from '../../common/utils/test-helpers/mockTypes';
import { ApplicationCodeService } from '../application-code/application-code.service';
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
          provide: ApplicationCodeService,
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

    const res = await controller.attachDocument('file', {
      isMultipart: () => true,
      file: () => mockFile,
      user: {
        entity: mockUser,
      },
    });

    expect(res.mimeType).toEqual(mockDocument.document.mimeType);

    expect(appDocumentService.attachDocument).toHaveBeenCalled();
    expect(appDocumentService.attachDocument.mock.calls[0][0]).toEqual('file');
    expect(appDocumentService.attachDocument.mock.calls[0][1]).toEqual(
      mockFile,
    );
    expect(appDocumentService.attachDocument.mock.calls[0][2]).toEqual(
      mockUser,
    );
  });

  it('should throw an exception if request is not the right type', async () => {
    const mockFile = {};
    const mockUser = {};

    appDocumentService.attachDocument.mockResolvedValue(mockDocument);

    await expect(
      controller.attachDocument('file', {
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

    const res = await controller.listDocuments('fake-number');

    expect(res[0].mimeType).toEqual(mockDocument.document.mimeType);
  });

  it('should call through to delete documents', async () => {
    appDocumentService.delete.mockResolvedValue(mockDocument);
    appDocumentService.get.mockResolvedValue(mockDocument);

    await controller.delete('fake-uuid');

    expect(appDocumentService.get).toHaveBeenCalled();
    expect(appDocumentService.delete).toHaveBeenCalled();
  });

  it('should call through for download', async () => {
    const fakeUrl = 'fake-url';
    appDocumentService.getDownloadUrl.mockResolvedValue(fakeUrl);
    appDocumentService.get.mockResolvedValue(mockDocument);

    const res = await controller.download('fake-uuid');

    expect(res.url).toEqual(fakeUrl);
  });
});
