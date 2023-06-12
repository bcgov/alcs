import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { ApplicationCeoCriterionCode } from '../../application-decision/application-ceo-criterion/application-ceo-criterion.entity';
import { ApplicationCeoCriterionController } from './application-ceo-criterion.controller';
import { ApplicationCeoCriterionService } from './application-ceo-criterion.service';

describe('ApplicationCeoCriterionController', () => {
  let controller: ApplicationCeoCriterionController;
  let mockCeoCriterionService: DeepMocked<ApplicationCeoCriterionService>;

  beforeEach(async () => {
    mockCeoCriterionService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationCeoCriterionController],
      providers: [
        {
          provide: ApplicationCeoCriterionService,
          useValue: mockCeoCriterionService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
      imports: [ConfigModule],
    }).compile();

    controller = module.get<ApplicationCeoCriterionController>(
      ApplicationCeoCriterionController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call out to service when fetching ceo criterion', async () => {
    mockCeoCriterionService.fetch.mockResolvedValue([]);

    const holidays = await controller.fetch();

    expect(holidays).toBeDefined();
    expect(mockCeoCriterionService.fetch).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when updating ceo criterion', async () => {
    mockCeoCriterionService.update.mockResolvedValue(
      new ApplicationCeoCriterionCode(),
    );

    const holiday = await controller.update(
      'fake',
      new ApplicationCeoCriterionCode(),
    );

    expect(holiday).toBeDefined();
    expect(mockCeoCriterionService.update).toHaveBeenCalledTimes(1);
  });

  it('should throw an exception when trying to update MODI', async () => {
    const promise = controller.update(
      'MODI',
      new ApplicationCeoCriterionCode(),
    );

    await expect(promise).rejects.toMatchObject(
      new Error('Cannot modify Modi'),
    );
  });

  it('should call out to service when creating ceo criterion', async () => {
    mockCeoCriterionService.create.mockResolvedValue(
      new ApplicationCeoCriterionCode(),
    );

    const holiday = await controller.create(new ApplicationCeoCriterionCode());

    expect(holiday).toBeDefined();
    expect(mockCeoCriterionService.create).toHaveBeenCalledTimes(1);
  });
});
