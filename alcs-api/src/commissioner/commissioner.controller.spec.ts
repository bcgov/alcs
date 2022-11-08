import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { ApplicationAmendmentService } from '../decision/application-amendment/application-amendment.service';
import { ApplicationReconsiderationService } from '../decision/application-reconsideration/application-reconsideration.service';
import { ApplicationDto } from '../application/application.dto';
import { ApplicationService } from '../application/application.service';
import { CommissionerProfile } from '../common/automapper/commissioner.automapper.profile';
import { initApplicationMockEntity } from '../common/utils/test-helpers/mockEntities';
import { mockKeyCloakProviders } from '../common/utils/test-helpers/mockTypes';
import { CommissionerController } from './commissioner.controller';

describe('CommissionerController', () => {
  let controller: CommissionerController;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockReconsiderationService: DeepMocked<ApplicationReconsiderationService>;
  let mockAmendmentService: DeepMocked<ApplicationAmendmentService>;

  const fileNumber = 'fake-file';

  beforeEach(async () => {
    mockApplicationService = createMock();
    mockReconsiderationService = createMock();
    mockAmendmentService = createMock();

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
          provide: ApplicationAmendmentService,
          useValue: mockAmendmentService,
        },
        {
          provide: ApplicationReconsiderationService,
          useValue: mockReconsiderationService,
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

    mockApplicationService.get.mockResolvedValue(
      initApplicationMockEntity(fileNumber),
    );
    mockApplicationService.mapToDtos.mockResolvedValue([]);
    mockAmendmentService.getByApplication.mockResolvedValue([]);
    mockReconsiderationService.getByApplication.mockResolvedValue([]);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call through to application service for fetch', async () => {
    const res = await controller.get('fake-file');

    expect(mockApplicationService.get).toHaveBeenCalledTimes(1);
    expect(mockAmendmentService.getByApplication).toHaveBeenCalledTimes(1);
    expect(mockReconsiderationService.getByApplication).toHaveBeenCalledTimes(
      1,
    );
    expect(mockApplicationService.get.mock.calls[0][0]).toEqual(fileNumber);
    expect(res.hasRecons).toBeFalsy();
    expect(res.hasAmendments).toBeFalsy();
  });

  it('should set recon and amendment flags if they exist', async () => {
    mockAmendmentService.getByApplication.mockResolvedValue([
      {
        isReviewApproved: true,
      } as any,
    ]);
    mockReconsiderationService.getByApplication.mockResolvedValue([{} as any]);

    const res = await controller.get(fileNumber);

    expect(mockAmendmentService.getByApplication).toHaveBeenCalledTimes(1);
    expect(mockReconsiderationService.getByApplication).toHaveBeenCalledTimes(
      1,
    );
    expect(res.hasRecons).toBeTruthy();
    expect(res.hasAmendments).toBeTruthy();
  });

  it('should set amendment flag to false if it was not approved', async () => {
    mockAmendmentService.getByApplication.mockResolvedValue([
      {
        isReviewApproved: false,
      } as any,
    ]);
    mockReconsiderationService.getByApplication.mockResolvedValue([{} as any]);

    const res = await controller.get(fileNumber);

    expect(mockAmendmentService.getByApplication).toHaveBeenCalledTimes(1);
    expect(res.hasAmendments).toBeFalsy();
  });

  it('should map to the dto correctly', async () => {
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

    const mappedApp = await controller.get(fileNumber);

    expect(mappedApp.localGovernment).toEqual(mockDto.localGovernment);
    expect('summary' in mappedApp).toBeFalsy();
    expect(mappedApp.fileNumber).toEqual(fileNumber);
  });
});
