import { RedisService } from '@app/common/redis/redis.service';
import {
  KEYCLOAK_CONNECT_OPTIONS,
  KEYCLOAK_INSTANCE,
  KEYCLOAK_LOGGER,
} from 'nest-keycloak-connect';
import { KeycloakMultiTenantService } from 'nest-keycloak-connect/services/keycloak-multitenant.service';
import { UserService } from '../../src/user/user.service';
import { mockAppLoggerService } from './mockLogger';

export type MockType<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [P in keyof T]?: jest.Mock<{}>;
};

/**
 * Used to mock the secondary dependencies of keyCloak, should not be used when test actually needs to test keycloak
 */
export const mockKeyCloakProviders = [
  {
    provide: KEYCLOAK_INSTANCE,
    useValue: {},
  },
  {
    provide: KEYCLOAK_CONNECT_OPTIONS,
    useValue: {},
  },
  {
    provide: KEYCLOAK_LOGGER,
    useValue: mockAppLoggerService,
  },
  KeycloakMultiTenantService,
  {
    provide: UserService,
    useValue: {},
  },
  {
    provide: RedisService,
    useValue: {},
  },
];

export const createMockQuery = () => {
  return {
    select: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
    getCount: jest.fn().mockResolvedValue(0),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    orderBy: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    innerJoinAndMapOne: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    setParameters: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    withDeleted: jest.fn().mockReturnThis(),
  };
};
