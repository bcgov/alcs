import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { DeepMocked, createMock } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { ApplicationParcelProfile } from '../../common/automapper/application-parcel.automapper.profile';
import { Application } from '../application.entity';
import { ApplicationService } from '../application.service';
import { ApplicationParcelController } from './application-parcel.controller';
import { ApplicationParcelUpdateDto } from './application-parcel.dto';
import { ApplicationParcel } from './application-parcel.entity';
import { ApplicationParcelService } from './application-parcel.service';

describe('ApplicationParcelController', () => {
  let controller: ApplicationParcelController;
  let mockApplicationParcelService: DeepMocked<ApplicationParcelService>;
  let mockApplicationService: DeepMocked<ApplicationService>;

  beforeEach(async () => {
    mockApplicationParcelService = createMock();
    mockApplicationService = createMock();

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
          provide: ApplicationService,
          useValue: mockApplicationService,
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
    mockApplicationParcelService.fetchByApplicationFileId.mockResolvedValue([]);

    const parcels = await controller.fetchByFileId('mockFileID');

    expect(parcels).toBeDefined();
    expect(
      mockApplicationParcelService.fetchByApplicationFileId,
    ).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when creating parcels', async () => {
    mockApplicationService.getOrFail.mockResolvedValue({} as Application);
    mockApplicationParcelService.create.mockResolvedValue(
      {} as ApplicationParcel,
    );

    const parcel = await controller.create({ applicationFileId: 'fake' });

    expect(mockApplicationService.getOrFail).toBeCalledTimes(1);
    expect(mockApplicationParcelService.create).toBeCalledTimes(1);
    expect(parcel).toBeDefined();
  });

  it('should call out to service when updating parcel', async () => {
    const mockUpdateDto: ApplicationParcelUpdateDto = {
      pid: 'mock_pid',
      pin: 'mock_pin',
      legalDescription: 'mock_legal',
      mapAreaHectares: 2,
      purchasedDate: 1,
      isFarm: true,
      isConfirmedByApplicant: true,
      ownershipTypeCode: 'SMPL',
    };

    mockApplicationParcelService.update.mockResolvedValue(
      {} as ApplicationParcel,
    );

    const parcel = await controller.update('fake_uuid', mockUpdateDto);

    expect(mockApplicationParcelService.update).toBeCalledTimes(1);
    expect(parcel).toBeDefined();
  });

  it('should call out to service when deleting parcel', async () => {
    const fakeUuid = 'fake_uuid';
    mockApplicationParcelService.delete.mockResolvedValue(fakeUuid);

    const result = await controller.delete(fakeUuid);

    expect(mockApplicationParcelService.delete).toBeCalledTimes(1);
    expect(result).toEqual({ uuid: fakeUuid });
  });
});
