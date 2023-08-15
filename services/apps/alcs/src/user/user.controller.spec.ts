import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { LocalGovernment } from '../alcs/local-government/local-government.entity';
import { UserProfile } from '../common/automapper/user.automapper.profile';
import {
  initMockUserDto,
  initUserMockEntity,
} from '../../test/mocks/mockEntities';
import { mockKeyCloakProviders } from '../../test/mocks/mockTypes';
import { UserController } from './user.controller';
import { UserDto } from './user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let mockUserService: DeepMocked<UserService>;
  let mockUser: Partial<User>;
  let mockUserDto: UserDto;
  let request;

  beforeEach(async () => {
    mockUserService = createMock();

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
          useValue: mockUserService,
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
      idirUserName: 'bat',
      clientRoles: [],
      bceidUserName: '',
      uuid: undefined,
      settings: {
        favoriteBoards: ['cats'],
      },
    };

    mockUserDto = {
      name: 'bruce wayne',
      identityProvider: 'test',
      initials: 'b',
      idirUserName: 'bat',
      clientRoles: [],
      bceidUserName: '',
      uuid: 'mock-uuid',
      settings: {
        favoriteBoards: ['cats'],
      },
      isFirstNationGovernment: false,
      isLocalGovernment: false,
    };

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should call getAssignableUsers on the service', async () => {
    mockUserService.getAssignableUsers.mockResolvedValue([mockUser as User]);

    const res = await controller.getAssignableUsers();

    expect(res[0].name).toEqual(mockUserDto.name);
    expect(res[0].initials).toEqual(mockUserDto.initials);
    expect(mockUserService.getAssignableUsers).toHaveBeenCalledTimes(1);
  });

  it('should call deleteUser on the service', async () => {
    mockUserService.delete.mockResolvedValue(mockUser as User);

    const res = await controller.deleteUser('');

    expect(res).toBeTruthy();
    expect(mockUserService.delete).toHaveBeenCalledTimes(1);
  });

  it('should call update user on the service', async () => {
    const mockUserDto = initMockUserDto();
    mockUserService.getByUuid.mockResolvedValueOnce(mockUser as User);
    mockUserService.update.mockResolvedValueOnce({} as any);
    request.user.entity.uuid = mockUser.uuid = mockUserDto.uuid;

    await controller.update(mockUserDto.uuid, mockUserDto, request);

    expect(mockUserService.update).toBeCalledTimes(1);
  });

  it('should fail on user update if user not found', async () => {
    mockUserService.getByUuid.mockResolvedValueOnce(null);
    const mockUserDto = initMockUserDto();
    request.user.entity.uuid = mockUser.uuid = mockUserDto.uuid;

    await expect(
      controller.update(mockUserDto.uuid, mockUserDto, request),
    ).rejects.toMatchObject(
      new Error(`User with uuid not found ${mockUserDto.uuid}`),
    );
  });

  it('should fail on user update if current user does not mach updating user', async () => {
    const mockUserDto = initMockUserDto();
    mockUserService.getByUuid.mockResolvedValueOnce(mockUser as User);
    mockUserService.update.mockResolvedValueOnce({} as any);

    await expect(
      controller.update(mockUserDto.uuid, mockUserDto, request),
    ).rejects.toMatchObject(
      new Error('You can update only your user details.'),
    );
  });

  it('return the current user', async () => {
    const mockEntity = initUserMockEntity();
    const governmentName = 'Government';

    mockUserService.getUserLocalGovernment.mockResolvedValue(
      new LocalGovernment({
        name: governmentName,
      }),
    );

    const res = await controller.getMyself({
      user: {
        entity: mockEntity,
      },
    });
    expect(res.name).toEqual(mockEntity.name);
    expect(res.government).toEqual(governmentName);
    expect(res.identityProvider).toEqual(mockEntity.identityProvider);
  });
});
