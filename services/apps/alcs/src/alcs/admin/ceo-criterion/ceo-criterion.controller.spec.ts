import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { CeoCriterionCode } from '../../decision/ceo-criterion/ceo-criterion.entity';
import { CeoCriterionController } from './ceo-criterion.controller';
import { CeoCriterionService } from './ceo-criterion.service';

describe('CeoCriterionController', () => {
  let controller: CeoCriterionController;
  let mockCeoCriterionService: DeepMocked<CeoCriterionService>;

  beforeEach(async () => {
    mockCeoCriterionService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CeoCriterionController],
      providers: [
        {
          provide: CeoCriterionService,
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

    controller = module.get<CeoCriterionController>(CeoCriterionController);
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
    mockCeoCriterionService.update.mockResolvedValue(new CeoCriterionCode());

    const holiday = await controller.update('fake', new CeoCriterionCode());

    expect(holiday).toBeDefined();
    expect(mockCeoCriterionService.update).toHaveBeenCalledTimes(1);
  });

  it('should throw an exception when trying to update MODI', async () => {
    const promise = controller.update('MODI', new CeoCriterionCode());

    await expect(promise).rejects.toMatchObject(
      new Error('Cannot modify Modi'),
    );
  });

  it('should call out to service when creating ceo criterion', async () => {
    mockCeoCriterionService.create.mockResolvedValue(new CeoCriterionCode());

    const holiday = await controller.create(new CeoCriterionCode());

    expect(holiday).toBeDefined();
    expect(mockCeoCriterionService.create).toHaveBeenCalledTimes(1);
  });
});
