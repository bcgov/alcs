import {
  KEYCLOAK_CONNECT_OPTIONS,
  KEYCLOAK_INSTANCE,
  KEYCLOAK_LOGGER,
} from 'nest-keycloak-connect';
import { KeycloakMultiTenantService } from 'nest-keycloak-connect/services/keycloak-multitenant.service';
import { UserService } from '../../../user/user.service';
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
];
