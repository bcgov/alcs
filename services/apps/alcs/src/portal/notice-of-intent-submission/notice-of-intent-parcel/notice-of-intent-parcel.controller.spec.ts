import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { NoticeOfIntentDocumentService } from '../../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentParcelProfile } from '../../../common/automapper/notice-of-intent-parcel.automapper.profile';
import { DocumentService } from '../../../document/document.service';
import { NoticeOfIntentOwnerService } from '../notice-of-intent-owner/notice-of-intent-owner.service';
import { NoticeOfIntentSubmission } from '../notice-of-intent-submission.entity';
import { NoticeOfIntentSubmissionService } from '../notice-of-intent-submission.service';
import { NoticeOfIntentParcelController } from './notice-of-intent-parcel.controller';
import { NoticeOfIntentParcelUpdateDto } from './notice-of-intent-parcel.dto';
import { NoticeOfIntentParcel } from './notice-of-intent-parcel.entity';
import { NoticeOfIntentParcelService } from './notice-of-intent-parcel.service';

describe('NoticeOfIntentParcelController', () => {
  let controller: NoticeOfIntentParcelController;
  let mockNOIParcelService: DeepMocked<NoticeOfIntentParcelService>;
  let mockNOIService: DeepMocked<NoticeOfIntentSubmissionService>;
  let mockNOIOwnerService: DeepMocked<NoticeOfIntentOwnerService>;
  let mockDocumentService: DeepMocked<DocumentService>;
  let mockNOIDocumentService: DeepMocked<NoticeOfIntentDocumentService>;

  beforeEach(async () => {
    mockNOIParcelService = createMock();
    mockNOIService = createMock();
    mockNOIOwnerService = createMock();
    mockDocumentService = createMock();
    mockNOIDocumentService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [NoticeOfIntentParcelController],
      providers: [
        NoticeOfIntentParcelProfile,
        {
          provide: NoticeOfIntentParcelService,
          useValue: mockNOIParcelService,
        },
        {
          provide: NoticeOfIntentSubmissionService,
          useValue: mockNOIService,
        },
        {
          provide: NoticeOfIntentOwnerService,
          useValue: mockNOIOwnerService,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: NoticeOfIntentDocumentService,
          useValue: mockNOIDocumentService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<NoticeOfIntentParcelController>(
      NoticeOfIntentParcelController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call out to service when fetching parcels', async () => {
    mockNOIParcelService.fetchByApplicationSubmissionUuid.mockResolvedValue([]);

    const parcels = await controller.fetchByFileId('mockFileID');

    expect(parcels).toBeDefined();
    expect(
      mockNOIParcelService.fetchByApplicationSubmissionUuid,
    ).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when creating parcels', async () => {
    mockNOIService.getOrFailByUuid.mockResolvedValue(
      {} as NoticeOfIntentSubmission,
    );
    mockNOIParcelService.create.mockResolvedValue({} as NoticeOfIntentParcel);
    mockNOIOwnerService.attachToParcel.mockResolvedValue();

    const parcel = await controller.create({
      noticeOfIntentSubmissionUuid: 'fake',
    });

    expect(mockNOIService.getOrFailByUuid).toBeCalledTimes(1);
    expect(mockNOIParcelService.create).toBeCalledTimes(1);
    expect(mockNOIOwnerService.attachToParcel).toBeCalledTimes(0);
    expect(parcel).toBeDefined();
  });

  it('should call out to service and revert newly created "other" parcel if failed to link it to and owner during creation process', async () => {
    const mockError = new Error('mock error');
    mockNOIService.getOrFailByUuid.mockResolvedValue(
      {} as NoticeOfIntentSubmission,
    );
    mockNOIParcelService.create.mockResolvedValue({} as NoticeOfIntentParcel);
    mockNOIOwnerService.attachToParcel.mockRejectedValue(mockError);
    mockNOIParcelService.deleteMany.mockResolvedValue([]);

    await expect(
      controller.create({
        noticeOfIntentSubmissionUuid: 'fake',
        ownerUuid: 'fake_uuid',
        parcelType: 'other',
      }),
    ).rejects.toMatchObject(mockError);

    expect(mockNOIService.getOrFailByUuid).toBeCalledTimes(1);
    expect(mockNOIParcelService.create).toBeCalledTimes(1);
    expect(mockNOIParcelService.deleteMany).toBeCalledTimes(1);
    expect(mockNOIOwnerService.attachToParcel).toBeCalledTimes(1);
  });

  it('should call out to service when updating parcel', async () => {
    const mockUpdateDto: NoticeOfIntentParcelUpdateDto[] = [
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

    mockNOIParcelService.update.mockResolvedValue([
      {},
    ] as NoticeOfIntentParcel[]);

    const parcel = await controller.update(mockUpdateDto);

    expect(mockNOIParcelService.update).toBeCalledTimes(1);
    expect(parcel).toBeDefined();
  });

  it('should call out to service when deleting parcel', async () => {
    const fakeUuid = 'fake_uuid';
    mockNOIParcelService.deleteMany.mockResolvedValue([]);

    const result = await controller.delete([fakeUuid]);

    expect(mockNOIParcelService.deleteMany).toBeCalledTimes(1);
    expect(result).toBeDefined();
  });
});
