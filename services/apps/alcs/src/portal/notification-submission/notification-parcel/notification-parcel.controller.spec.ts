import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { NoticeOfIntentParcelProfile } from '../../../common/automapper/notice-of-intent-parcel.automapper.profile';
import { NotificationParcelProfile } from '../../../common/automapper/notification-parcel.automapper.profile';
import { NotificationProfile } from '../../../common/automapper/notification.automapper.profile';
import { DocumentService } from '../../../document/document.service';
import { User } from '../../../user/user.entity';
import { NotificationSubmission } from '../notification-submission.entity';
import { NotificationSubmissionService } from '../notification-submission.service';
import { NotificationTransfereeService } from '../notification-transferee/notification-transferee.service';
import { NotificationParcelController } from './notification-parcel.controller';
import { NotificationParcelUpdateDto } from './notification-parcel.dto';
import { NotificationParcel } from './notification-parcel.entity';
import { NotificationParcelService } from './notification-parcel.service';

describe('NotificationParcelController', () => {
  let controller: NotificationParcelController;
  let mockNotificationParcelService: DeepMocked<NotificationParcelService>;
  let mockNotificationSubmissionsService: DeepMocked<NotificationSubmissionService>;
  let mockNotificationTransfereeService: DeepMocked<NotificationTransfereeService>;
  let mockDocumentService: DeepMocked<DocumentService>;
  let mockSubmission;

  beforeEach(async () => {
    mockNotificationParcelService = createMock();
    mockNotificationSubmissionsService = createMock();
    mockNotificationTransfereeService = createMock();
    mockDocumentService = createMock();

    mockSubmission = new NotificationSubmission({
      createdBy: new User(),
    });

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [NotificationParcelController],
      providers: [
        NotificationProfile,
        NotificationParcelProfile,
        {
          provide: NotificationParcelService,
          useValue: mockNotificationParcelService,
        },
        {
          provide: NotificationSubmissionService,
          useValue: mockNotificationSubmissionsService,
        },
        {
          provide: NotificationTransfereeService,
          useValue: mockNotificationTransfereeService,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<NotificationParcelController>(
      NotificationParcelController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call out to service when fetching parcels', async () => {
    mockNotificationParcelService.fetchByApplicationSubmissionUuid.mockResolvedValue(
      [],
    );

    const parcels = await controller.fetchByFileId('mockFileID');

    expect(parcels).toBeDefined();
    expect(
      mockNotificationParcelService.fetchByApplicationSubmissionUuid,
    ).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when creating parcels', async () => {
    mockNotificationSubmissionsService.getByUuid.mockResolvedValue(
      mockSubmission,
    );
    mockNotificationParcelService.create.mockResolvedValue(
      {} as NotificationParcel,
    );

    const parcel = await controller.create(
      {
        notificationSubmissionUuid: 'fake',
      },
      {
        user: {
          entity: new User(),
        },
      },
    );

    expect(mockNotificationSubmissionsService.getByUuid).toBeCalledTimes(1);
    expect(mockNotificationParcelService.create).toBeCalledTimes(1);
    expect(parcel).toBeDefined();
  });

  it('should call out to service when updating parcel', async () => {
    const mockUpdateDto: NotificationParcelUpdateDto[] = [
      {
        uuid: 'fake_uuid',
        pid: 'mock_pid',
        pin: 'mock_pin',
        legalDescription: 'mock_legal',
        mapAreaHectares: 2,
        isConfirmedByApplicant: true,
        ownershipTypeCode: 'SMPL',
      },
    ];

    mockNotificationParcelService.update.mockResolvedValue([
      {},
    ] as NotificationParcel[]);

    const parcel = await controller.update(mockUpdateDto, {
      user: {
        entity: new User(),
      },
    });

    expect(mockNotificationParcelService.update).toBeCalledTimes(1);
    expect(parcel).toBeDefined();
  });

  it('should call out to service when deleting parcel', async () => {
    const fakeUuid = 'fake_uuid';
    mockNotificationParcelService.deleteMany.mockResolvedValue([]);

    const result = await controller.delete([fakeUuid]);

    expect(mockNotificationParcelService.deleteMany).toBeCalledTimes(1);
    expect(result).toBeDefined();
  });
});
