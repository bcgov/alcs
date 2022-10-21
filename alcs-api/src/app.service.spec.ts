import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppService } from './app.service';
import {
  HealthCheckDbDto,
  HealthCheckDto,
} from './healthcheck/healthcheck.dto';
import { HealthCheck } from './healthcheck/healthcheck.entity';

describe('AppService', () => {
  let service: AppService;
  let repositoryMock: DeepMocked<Repository<HealthCheck>>;

  beforeEach(async () => {
    repositoryMock = createMock<Repository<HealthCheck>>();

    const appServiceModule: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: getRepositoryToken(HealthCheck),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = appServiceModule.get<AppService>(AppService);
  });

  it('AppService should be defined', () => {
    expect(service).toBeDefined();
  });

  it('AppService should return HealthCheckDto', async () => {
    const dbDto: HealthCheckDbDto = {
      read: true,
      write: true,
    };
    const result = { alive: true, db: dbDto };
    repositoryMock.findOne.mockResolvedValue({} as HealthCheck);
    repositoryMock.save.mockResolvedValue({} as HealthCheck);

    expect(await service.getHealthStatus()).toStrictEqual(result);
  });

  it('AppService should return HealthCheckDto and suppress exception', async () => {
    const dbDto: HealthCheckDbDto = {
      read: false,
      write: false,
    };
    const result: HealthCheckDto = { alive: true, db: dbDto };
    repositoryMock.findOne.mockRejectedValue(new Error('Expected error'));

    expect(await service.getHealthStatus()).toStrictEqual(result);
  });
});
