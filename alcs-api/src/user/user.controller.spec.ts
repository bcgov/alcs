import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { RoleGuard } from '../common/authorization/role.guard';
import { UserProfile } from '../common/automapper/user.automapper.profile';
import { initAssigneeMockDto } from '../common/utils/test-helpers/mockEntities';
import { UserController } from './user.controller';
import { UserService } from './user.service';

jest.mock('../common/authorization/role.guard', () => ({
  RoleGuard: createMock<RoleGuard>(),
}));

describe('UserController', () => {
  let controller: UserController;
  let mockService: DeepMocked<UserService>;
  let mockRes;
  let request;

  beforeEach(async () => {
    mockService = createMock<UserService>();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController, UserProfile],
      providers: [
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

    mockRes = {
      email: 'bruce@wayne.com',
      name: 'bruce',
      displayName: 'bruce wayne',
      identityProvider: 'test',
      preferredUsername: 'wayne',
      givenName: 'bruce',
      familyName: 'wayne',
      idirUserGuid: '001bat',
      idirUserName: 'bat',
      initials: 'BW',
      mentionLabel: 'BruceWayne',
      uuid: undefined,
    };

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should call listUser on the service', async () => {
    mockService.getAll.mockResolvedValue([mockRes]);
    const res = await controller.getUsers();
    expect(res).toEqual([mockRes]);
    expect(mockService.getAll).toHaveBeenCalledTimes(1);
  });

  it('should call deleteUser on the service', async () => {
    mockService.delete.mockResolvedValue(mockRes);
    const res = await controller.deleteUser('');
    expect(res).toEqual(mockRes);
    expect(mockService.delete).toHaveBeenCalledTimes(1);
  });

  it('should call update user on the service', async () => {
    const mockUserDto = initAssigneeMockDto();
    mockService.get.mockResolvedValueOnce(mockRes);
    mockService.update.mockResolvedValueOnce(undefined);
    request.user.entity.uuid = mockRes.uuid = mockUserDto.uuid;

    await controller.update(mockUserDto, request);

    expect(mockService.update).toBeCalledTimes(1);
  });

  it('should fail on user update if user not found', async () => {
    mockService.get.mockResolvedValueOnce(undefined);
    const mockUserDto = initAssigneeMockDto();

    await expect(controller.update(mockUserDto, request)).rejects.toMatchObject(
      new Error(`User with provided email not found ${mockUserDto.email}`),
    );
  });

  it('should fail on user update if current user does not mach updating user', async () => {
    const mockUserDto = initAssigneeMockDto();
    mockService.get.mockResolvedValueOnce(mockRes);
    mockService.update.mockResolvedValueOnce(undefined);

    await expect(controller.update(mockUserDto, request)).rejects.toMatchObject(
      new Error('You can update only your user details.'),
    );
  });
});
