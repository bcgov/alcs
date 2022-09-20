import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MockType,
  repositoryMockFactory,
} from '../common/utils/test-helpers/mockTypes';
import { Card } from './card.entity';
import { CardService } from './card.service';

describe('CardService', () => {
  let service: CardService;
  let cardRepositoryMock: MockType<Repository<Card>>;

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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
