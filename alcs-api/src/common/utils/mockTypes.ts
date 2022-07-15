import {
  KEYCLOAK_CONNECT_OPTIONS,
  KEYCLOAK_INSTANCE,
  KEYCLOAK_LOGGER,
} from 'nest-keycloak-connect';
import { KeycloakMultiTenantService } from 'nest-keycloak-connect/services/keycloak-multitenant.service';
import { Repository } from 'typeorm';
import { UserService } from '../../user/user.service';

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<{}>;
};

export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
  () => ({
    findOne: jest.fn((entity) => entity),
    save: jest.fn((entity) => entity),
  }),
);

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
    useValue: {
      log: () => {},
      debug: () => {},
      warn: () => {},
      error: () => {},
    },
  },
  KeycloakMultiTenantService,
  {
    provide: UserService,
    useValue: {},
  },
];
