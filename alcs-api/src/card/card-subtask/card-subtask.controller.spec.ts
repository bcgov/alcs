import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { ApplicationSubtaskProfile } from '../../common/automapper/application-subtask.automapper.profile';
import { ServiceNotFoundException } from '../../common/exceptions/base.exception';
import { mockKeyCloakProviders } from '../../common/utils/test-helpers/mockTypes';
import { Card } from '../card.entity';
import { CardService } from '../card.service';
import { CardSubtaskType } from './card-subtask-type/card-subtask-type.entity';
import { CardSubtaskController } from './card-subtask.controller';
import { CardSubtask } from './card-subtask.entity';
import { CardSubtaskService } from './card-subtask.service';

describe('CardSubtaskController', () => {
  let controller: CardSubtaskController;
  let mockSubtaskService: DeepMocked<CardSubtaskService>;
  let cardService: DeepMocked<CardService>;

  const mockSubtask: Partial<CardSubtask> = {
    uuid: 'fake-uuid',
    createdAt: new Date(1662762964667),
    type: {
      backgroundColor: 'back-color',
      textColor: 'text-color',
    } as CardSubtaskType,
  };

  beforeEach(async () => {
    mockSubtaskService = createMock<CardSubtaskService>();
    cardService = createMock<CardService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [CardSubtaskController],
      providers: [
        {
          provide: CardSubtaskService,
          useValue: mockSubtaskService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        {
          provide: CardService,
          useValue: cardService,
        },
        ApplicationSubtaskProfile,
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<CardSubtaskController>(CardSubtaskController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call the service and map to dto for create', async () => {
    mockSubtaskService.create.mockResolvedValue(mockSubtask as CardSubtask);
    cardService.get.mockResolvedValue({} as Card);

    const res = await controller.create('mock-file', 'mock-type');

    expect(mockSubtaskService.create).toHaveBeenCalled();

    expect(res.backgroundColor).toEqual(mockSubtask.type.backgroundColor);
    expect(cardService.get).toHaveBeenCalled();
    expect(res.textColor).toEqual(mockSubtask.type.textColor);
    expect(res.createdAt).toEqual(mockSubtask.createdAt.getTime());
  });

  it('should return the new entity for update', async () => {
    const completionDate = new Date(1662762964677);
    mockSubtaskService.update.mockResolvedValue({
      ...mockSubtask,
      completedAt: completionDate,
    } as CardSubtask);

    const res = await controller.update(mockSubtask.uuid, {
      completedAt: 1662762964677,
    });

    expect(mockSubtaskService.update).toHaveBeenCalled();
    expect(res.completedAt).toEqual(completionDate.getTime());
  });

  it('should call through for delete', async () => {
    mockSubtaskService.delete.mockResolvedValue();

    await controller.delete(mockSubtask.uuid);

    expect(mockSubtaskService.delete).toHaveBeenCalled();
    expect(mockSubtaskService.delete.mock.calls[0][0]).toEqual(
      mockSubtask.uuid,
    );
  });

  it("should throw an exception if card doesn't exist for create", async () => {
    cardService.get.mockResolvedValue(undefined);

    await expect(
      controller.create('mock-card', 'mock-type'),
    ).rejects.toMatchObject(
      new ServiceNotFoundException(`Card not found mock-card`),
    );

    expect(cardService.get).toHaveBeenCalledTimes(1);
    expect(mockSubtaskService.create).toHaveBeenCalledTimes(0);
  });
});
