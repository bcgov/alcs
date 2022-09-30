import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { initCardMockEntity } from '../common/utils/test-helpers/mockEntities';
import {
  MockType,
  repositoryMockFactory,
} from '../common/utils/test-helpers/mockTypes';
import { CardUpdateServiceDto } from './card.dto';
import { Card } from './card.entity';
import { CardService } from './card.service';

describe('CardService', () => {
  let service: CardService;
  let cardRepositoryMock: MockType<Repository<Card>>;
  const mockCardEntity = initCardMockEntity();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        CardService,
        {
          provide: getRepositoryToken(Card),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<CardService>(CardService);

    cardRepositoryMock = module.get(getRepositoryToken(Card));
    cardRepositoryMock.findOne.mockReturnValue(mockCardEntity);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get card', async () => {
    expect(await service.get('fake')).toStrictEqual(mockCardEntity);
  });

  it('should call save when an Card is updated', async () => {
    const payload: Partial<CardUpdateServiceDto> = {
      assigneeUuid: mockCardEntity.assigneeUuid,
      statusUuid: mockCardEntity.statusUuid,
      boardUuid: mockCardEntity.boardUuid,
    };

    const result = await service.update(mockCardEntity.uuid, payload);
    expect(result).toStrictEqual(mockCardEntity);
    expect(cardRepositoryMock.save).toHaveBeenCalled();
    expect(cardRepositoryMock.save).toHaveBeenCalledWith(mockCardEntity);
  });
});
