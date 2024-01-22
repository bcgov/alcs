import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { ApplicationDocumentService } from '../../../alcs/application/application-document/application-document.service';
import { ApplicationParcelProfile } from '../../../common/automapper/application-parcel.automapper.profile';
import { DocumentService } from '../../../document/document.service';
import { ApplicationOwnerService } from '../application-owner/application-owner.service';
import { ApplicationSubmission } from '../application-submission.entity';
import { ApplicationSubmissionService } from '../application-submission.service';
import { ApplicationParcelController } from './application-parcel.controller';
import { ApplicationParcelUpdateDto } from './application-parcel.dto';
import { ApplicationParcel } from './application-parcel.entity';
import { ApplicationParcelService } from './application-parcel.service';

describe('ApplicationParcelController', () => {
  let controller: ApplicationParcelController;
  let mockApplicationParcelService: DeepMocked<ApplicationParcelService>;
  let mockApplicationService: DeepMocked<ApplicationSubmissionService>;
  let mockApplicationOwnerService: DeepMocked<ApplicationOwnerService>;
  let mockDocumentService: DeepMocked<DocumentService>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;

  beforeEach(async () => {
    mockApplicationParcelService = createMock();
    mockApplicationService = createMock();
    mockApplicationOwnerService = createMock();
    mockDocumentService = createMock();
    mockAppDocumentService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationParcelController],
      providers: [
        ApplicationParcelProfile,
        {
          provide: ApplicationParcelService,
          useValue: mockApplicationParcelService,
        },
        {
          provide: ApplicationSubmissionService,
          useValue: mockApplicationService,
        },
        {
          provide: ApplicationOwnerService,
          useValue: mockApplicationOwnerService,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocumentService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<ApplicationParcelController>(
      ApplicationParcelController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call out to service when fetching parcels', async () => {
    mockApplicationParcelService.fetchByApplicationSubmissionUuid.mockResolvedValue(
      [],
    );

    const parcels = await controller.fetchByFileId('mockFileID');

    expect(parcels).toBeDefined();
    expect(
      mockApplicationParcelService.fetchByApplicationSubmissionUuid,
    ).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when creating parcels', async () => {
    mockApplicationService.getOrFailByUuid.mockResolvedValue(
      {} as ApplicationSubmission,
    );
    mockApplicationParcelService.create.mockResolvedValue(
      {} as ApplicationParcel,
    );
    mockApplicationOwnerService.attachToParcel.mockResolvedValue();

    const parcel = await controller.create({
      applicationSubmissionUuid: 'fake',
    });

    expect(mockApplicationService.getOrFailByUuid).toBeCalledTimes(1);
    expect(mockApplicationParcelService.create).toBeCalledTimes(1);
    expect(mockApplicationOwnerService.attachToParcel).toBeCalledTimes(0);
    expect(parcel).toBeDefined();
  });

  it('should call out to service and revert newly created "other" parcel if failed to link it to and owner during creation process', async () => {
    const mockError = new Error('mock error');
    mockApplicationService.getOrFailByUuid.mockResolvedValue(
      {} as ApplicationSubmission,
    );
    mockApplicationParcelService.create.mockResolvedValue(
      {} as ApplicationParcel,
    );
    mockApplicationOwnerService.attachToParcel.mockRejectedValue(mockError);
    mockApplicationParcelService.deleteMany.mockResolvedValue([]);

    await expect(
      controller.create({
        applicationSubmissionUuid: 'fake',
        ownerUuid: 'fake_uuid',
      }),
    ).rejects.toMatchObject(mockError);

    expect(mockApplicationService.getOrFailByUuid).toBeCalledTimes(1);
    expect(mockApplicationParcelService.create).toBeCalledTimes(1);
    expect(mockApplicationParcelService.deleteMany).toBeCalledTimes(1);
    expect(mockApplicationOwnerService.attachToParcel).toBeCalledTimes(1);
  });

  it('should call out to service when updating parcel', async () => {
    const mockUpdateDto: ApplicationParcelUpdateDto[] = [
      {
        uuid: 'fake_uuid',
        pid: 'mock_pid',
        pin: 'mock_pin',
        legalDescription: 'mock_legal',
        mapAreaHectares: 2,
        purchasedDate: 1,
        isFarm: true,
        isConfirmedByApplicant: true,
        ownershipTypeCode: 'SMPL',
        ownerUuids: null,
      },
    ];

    mockApplicationParcelService.update.mockResolvedValue([
      {},
    ] as ApplicationParcel[]);

    const parcel = await controller.update(mockUpdateDto);

    expect(mockApplicationParcelService.update).toBeCalledTimes(1);
    expect(parcel).toBeDefined();
  });

  it('should call out to service when deleting parcel', async () => {
    const fakeUuid = 'fake_uuid';
    mockApplicationParcelService.deleteMany.mockResolvedValue([]);

    const result = await controller.delete([fakeUuid]);

    expect(mockApplicationParcelService.deleteMany).toBeCalledTimes(1);
    expect(result).toBeDefined();
  });
});
