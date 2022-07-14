import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppService } from './app.service';
import { MockType, repositoryMockFactory } from './common/utils/mockTypes';
import {
  HealthCheckDbDto,
  HealthCheckDto,
} from './healthcheck/healthcheck.dto';
import { HealthCheck } from './healthcheck/healthcheck.entity';

describe('AppService', () => {
  let service: AppService;
  let repositoryMock: MockType<Repository<HealthCheck>>;

  beforeEach(async () => {
    const appServiceModule: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: getRepositoryToken(HealthCheck),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    repositoryMock = appServiceModule.get(getRepositoryToken(HealthCheck));
    service = appServiceModule.get<AppService>(AppService);
  });

  it('AppService should be defined', () => {
    expect(service).toBeDefined();
  });

  it('AppController should return HealthCheckDto', async () => {
    const dbDto: HealthCheckDbDto = {
      read: true,
      write: true,
    };
    const result: HealthCheckDto = { alive: true, db: dbDto };
    repositoryMock.findOne.mockReturnValue(HealthCheckDto);

    expect(await service.getHealthStatus()).toStrictEqual(result);
  });
});
