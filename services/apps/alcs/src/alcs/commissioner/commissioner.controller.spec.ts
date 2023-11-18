import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { initApplicationMockEntity } from '../../../test/mocks/mockEntities';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { TrackingService } from '../../common/tracking/tracking.service';
import { User } from '../../user/user.entity';
import { ApplicationDto } from '../application/application.dto';
import { ApplicationService } from '../application/application.service';
import { CommissionerProfile } from '../../common/automapper/commissioner.automapper.profile';
import { ApplicationModificationService } from '../application-decision/application-modification/application-modification.service';
import { ApplicationReconsiderationService } from '../application-decision/application-reconsideration/application-reconsideration.service';
import { CommissionerController } from './commissioner.controller';

describe('CommissionerController', () => {
  let controller: CommissionerController;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockReconsiderationService: DeepMocked<ApplicationReconsiderationService>;
  let mockModificationService: DeepMocked<ApplicationModificationService>;
  let mockTrackingService: DeepMocked<TrackingService>;
  let mockRequest;

  const fileNumber = 'fake-file';

  beforeEach(async () => {
    mockApplicationService = createMock();
    mockReconsiderationService = createMock();
    mockModificationService = createMock();
    mockTrackingService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        CommissionerProfile,
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
        {
          provide: ApplicationModificationService,
          useValue: mockModificationService,
        },
        {
          provide: ApplicationReconsiderationService,
          useValue: mockReconsiderationService,
        },
        {
          provide: TrackingService,
          useValue: mockTrackingService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
      controllers: [CommissionerController],
    }).compile();

    controller = module.get<CommissionerController>(CommissionerController);

    mockApplicationService.getOrFail.mockResolvedValue(
      initApplicationMockEntity(fileNumber),
    );
    mockApplicationService.mapToDtos.mockResolvedValue([]);
    mockModificationService.getByApplication.mockResolvedValue([]);
    mockReconsiderationService.getByApplication.mockResolvedValue([]);
    mockTrackingService.trackView.mockResolvedValue();

    mockRequest = {
      user: {
        entity: new User(),
      },
    };
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call through to application service for fetch', async () => {
    const res = await controller.get('fake-file', mockRequest);

    expect(mockApplicationService.getOrFail).toHaveBeenCalledTimes(1);
    expect(mockModificationService.getByApplication).toHaveBeenCalledTimes(1);
    expect(mockReconsiderationService.getByApplication).toHaveBeenCalledTimes(
      1,
    );
    expect(mockApplicationService.getOrFail.mock.calls[0][0]).toEqual(
      fileNumber,
    );
    expect(res.hasRecons).toBeFalsy();
    expect(res.hasModifications).toBeFalsy();
    expect(mockTrackingService.trackView).toHaveBeenCalledTimes(1);
  });

  it('should set recon and modification flags if they exist', async () => {
    mockModificationService.getByApplication.mockResolvedValue([
      {
        reviewOutcome: { code: 'PRC' },
      } as any,
    ]);
    mockReconsiderationService.getByApplication.mockResolvedValue([{} as any]);

    const res = await controller.get(fileNumber, mockRequest);

    expect(mockModificationService.getByApplication).toHaveBeenCalledTimes(1);
    expect(mockReconsiderationService.getByApplication).toHaveBeenCalledTimes(
      1,
    );
    expect(res.hasRecons).toBeTruthy();
    expect(res.hasModifications).toBeTruthy();
    expect(mockTrackingService.trackView).toHaveBeenCalledTimes(1);
  });

  it('should set modification flag to REF if it was not approved', async () => {
    mockModificationService.getByApplication.mockResolvedValue([
      {
        reviewOutcome: {
          code: 'REF',
        },
      } as any,
    ]);
    mockReconsiderationService.getByApplication.mockResolvedValue([{} as any]);

    const res = await controller.get(fileNumber, mockRequest);

    expect(mockModificationService.getByApplication).toHaveBeenCalledTimes(1);
    expect(res.hasModifications).toBeFalsy();
    expect(mockTrackingService.trackView).toHaveBeenCalledTimes(1);
  });

  it('should map to the dto correctly', async () => {
    mockTrackingService.trackView.mockResolvedValue();
    const mockDto: ApplicationDto = {
      fileNumber,
      summary: 'fake-summary',
      applicant: 'fake-applicant',
      localGovernment: {
        uuid: '',
        name: 'goverment-name',
        preferredRegionCode: 'code',
      },
    } as any;
    mockApplicationService.mapToDtos.mockResolvedValue([mockDto]);

    const mappedApp = await controller.get(fileNumber, mockRequest);

    expect(mappedApp.localGovernment).toEqual(mockDto.localGovernment);
    expect('summary' in mappedApp).toBeFalsy();
    expect(mappedApp.fileNumber).toEqual(fileNumber);
    expect(mockTrackingService.trackView).toHaveBeenCalledTimes(1);
  });
});
