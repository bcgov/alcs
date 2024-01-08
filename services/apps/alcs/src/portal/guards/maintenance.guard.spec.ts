import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CONFIG_VALUE,
  Configuration,
} from '../../common/entities/configuration.entity';
import { MaintenanceGuard } from './maintenance.guard';

describe('MaintenanceGuard', () => {
  let guard: MaintenanceGuard;
  let mockContext: DeepMocked<ExecutionContext>;
  let mockRepo: DeepMocked<Repository<Configuration>>;

  const mockHttpContext = {
    getRequest: () => ({}),
  } as any;

  beforeEach(async () => {
    mockRepo = createMock();
    mockContext = createMock<ExecutionContext>();
    mockContext.switchToHttp.mockReturnValue(mockHttpContext);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenanceGuard,
        {
          provide: getRepositoryToken(Configuration),
          useValue: mockRepo,
        },
      ],
    }).compile();

    guard = module.get<MaintenanceGuard>(MaintenanceGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should accept if request is not for portal or public', async () => {
    mockContext.switchToHttp.mockReturnValue({
      getRequest: () => ({
        routeOptions: {
          url: '/alcs/whatever',
        },
      }),
    } as any);

    const isAllowed = await guard.canActivate(mockContext);
    expect(isAllowed).toEqual(true);
  });

  it('should accept if request is for portal and maintenance mode is off', async () => {
    mockContext.switchToHttp.mockReturnValue({
      getRequest: () => ({
        routeOptions: {
          url: '/portal/whatever',
        },
      }),
    } as any);

    mockRepo.findOne.mockResolvedValue(
      new Configuration({
        value: 'false',
        name: CONFIG_VALUE.PORTAL_MAINTENANCE_MODE,
      }),
    );

    const isAllowed = await guard.canActivate(mockContext);
    expect(isAllowed).toEqual(true);
  });

  it('should reject if request is for portal and maintenance mode is on', async () => {
    mockContext.switchToHttp.mockReturnValue({
      getRequest: () => ({
        routeOptions: {
          url: '/portal/whatever',
        },
      }),
    } as any);

    mockRepo.findOne.mockResolvedValue(
      new Configuration({
        value: 'true',
        name: CONFIG_VALUE.PORTAL_MAINTENANCE_MODE,
      }),
    );

    const promise = guard.canActivate(mockContext);
    await expect(promise).rejects.toMatchObject(
      new HttpException(
        'Portal is in Maintenance Mode',
        HttpStatus.SERVICE_UNAVAILABLE,
      ),
    );
  });

  it('should accept if request is for public and maintenance mode is off', async () => {
    mockContext.switchToHttp.mockReturnValue({
      getRequest: () => ({
        routeOptions: {
          url: '/public/whatever',
        },
      }),
    } as any);

    mockRepo.findOne.mockResolvedValue(
      new Configuration({
        value: 'false',
        name: CONFIG_VALUE.PORTAL_MAINTENANCE_MODE,
      }),
    );

    const isAllowed = await guard.canActivate(mockContext);
    expect(isAllowed).toEqual(true);
  });

  it('should reject if request is for public and maintenance mode is on', async () => {
    mockContext.switchToHttp.mockReturnValue({
      getRequest: () => ({
        routeOptions: {
          url: '/public/whatever',
        },
      }),
    } as any);

    mockRepo.findOne.mockResolvedValue(
      new Configuration({
        value: 'true',
        name: CONFIG_VALUE.PORTAL_MAINTENANCE_MODE,
      }),
    );

    const promise = guard.canActivate(mockContext);
    await expect(promise).rejects.toMatchObject(
      new HttpException(
        'Portal is in Maintenance Mode',
        HttpStatus.SERVICE_UNAVAILABLE,
      ),
    );
  });
});
