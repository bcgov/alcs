import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../test/mocks/mockTypes';
import { UserProfile } from '../common/automapper/user.automapper.profile';
import { UserController } from './user.controller';
import { UserDto } from './user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let mockService: DeepMocked<UserService>;
  let mockUser: Partial<User>;
  let mockUserDto: UserDto;
  let request;

  beforeEach(async () => {
    mockService = createMock<UserService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController, UserProfile],
      providers: [
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
        //Keep this below mockKeyCloak as it overrides the one from there
        {
          provide: UserService,
          useValue: mockService,
        },
      ],
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
    }).compile();

    request = {
      user: {
        entity: {
          uuid: 'fake-uuid',
        },
      },
    };

    mockUser = {
      email: 'bruce@wayne.com',
      name: 'bruce wayne',
      identityProvider: 'test',
      clientRoles: [],
      bceidUserName: '',
      uuid: undefined,
    };

    mockUserDto = {
      name: 'bruce wayne',
      identityProvider: 'test',
      clientRoles: [],
      bceidUserName: '',
      uuid: 'mock-uuid',
    };

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('return the current user', async () => {
    const mockEntity = new User({
      name: 'batman',
    });

    const res = await controller.getMyself({
      user: {
        entity: mockEntity,
      },
    });
    expect(res.name).toEqual(mockEntity.name);
    expect(res.identityProvider).toEqual(mockEntity.identityProvider);
  });
});
