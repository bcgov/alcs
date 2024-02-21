import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { ApplicationDecisionProfile } from '../../../common/automapper/application-decision-v2.automapper.profile';
import { ApplicationBoundaryAmendmentController } from './application-boundary-amendment.controller';
import { UpdateApplicationBoundaryAmendmentDto } from './application-boundary-amendment.dto';
import { ApplicationBoundaryAmendment } from './application-boundary-amendment.entity';
import { ApplicationBoundaryAmendmentService } from './application-boundary-amendment.service';

describe('ApplicationBoundaryAmendmentController', () => {
  let controller: ApplicationBoundaryAmendmentController;
  let mockAppBoundaryService: DeepMocked<ApplicationBoundaryAmendmentService>;

  beforeEach(async () => {
    mockAppBoundaryService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationBoundaryAmendmentController],
      providers: [
        ApplicationDecisionProfile,
        {
          provide: ApplicationBoundaryAmendmentService,
          useValue: mockAppBoundaryService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();
    controller = module.get<ApplicationBoundaryAmendmentController>(
      ApplicationBoundaryAmendmentController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call through for list', async () => {
    mockAppBoundaryService.list.mockResolvedValue([
      new ApplicationBoundaryAmendment({
        decisionComponents: [],
      }),
    ]);
    const mockFileNumber = 'fileNumber';

    const res = await controller.list(mockFileNumber);

    expect(res).toBeDefined();
    expect(mockAppBoundaryService.list).toHaveBeenCalledTimes(1);
    expect(mockAppBoundaryService.list).toHaveBeenCalledWith(mockFileNumber);
  });

  it('should call through for create', async () => {
    mockAppBoundaryService.create.mockResolvedValue(
      new ApplicationBoundaryAmendment({
        decisionComponents: [],
      }),
    );
    const mockFileNumber = 'fileNumber';
    const createDto = {
      type: '',
      area: 0,
      decisionComponentUuids: [],
      year: 1990,
      period: 1,
    };

    const res = await controller.create(mockFileNumber, createDto);

    expect(res).toBeDefined();
    expect(mockAppBoundaryService.create).toHaveBeenCalledTimes(1);
    expect(mockAppBoundaryService.create).toHaveBeenCalledWith(
      mockFileNumber,
      createDto,
    );
  });

  it('should call through for update', async () => {
    mockAppBoundaryService.update.mockResolvedValue(
      new ApplicationBoundaryAmendment({
        decisionComponents: [],
      }),
    );
    const mockUuid = 'uuid';
    const updateDto: UpdateApplicationBoundaryAmendmentDto = {
      type: '',
      area: 0,
      decisionComponentUuids: [],
      year: 1990,
      period: 1,
    };

    const res = await controller.update(mockUuid, updateDto);

    expect(res).toBeDefined();
    expect(mockAppBoundaryService.update).toHaveBeenCalledTimes(1);
    expect(mockAppBoundaryService.update).toHaveBeenCalledWith(
      mockUuid,
      updateDto,
    );
  });

  it('should call through for delete', async () => {
    mockAppBoundaryService.delete.mockResolvedValue(
      new ApplicationBoundaryAmendment({
        decisionComponents: [],
      }),
    );
    const mockUuid = 'uuid';

    const res = await controller.delete(mockUuid);

    expect(res).toBeDefined();
    expect(mockAppBoundaryService.delete).toHaveBeenCalledTimes(1);
    expect(mockAppBoundaryService.delete).toHaveBeenCalledWith(mockUuid);
  });
});
