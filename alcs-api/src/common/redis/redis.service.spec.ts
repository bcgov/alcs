import { Test, TestingModule } from '@nestjs/testing';
import * as config from 'config';
import { CONFIG_TOKEN } from '../config/config.module';
import { RedisService } from './redis.service';

jest.mock('redis', () => ({
  createClient: () => ({
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue({}),
  }),
}));

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: CONFIG_TOKEN,
          useValue: config,
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the client', () => {
    expect(service.getClient()).toBeDefined();
  });
});
