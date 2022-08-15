import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { RoleGuard } from '../common/authorization/role.guard';
import { UserProfile } from '../common/automapper/user.automapper.profile';
import { UserController } from './user.controller';
import { UserService } from './user.service';

jest.mock('../common/authorization/role.guard', () => ({
  RoleGuard: createMock<RoleGuard>(),
}));

describe('UserController', () => {
  let controller: UserController;
  let mockService: DeepMocked<UserService>;
  let mockRes;

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
    mockService.listUsers.mockResolvedValue([mockRes]);
    const res = await controller.getUsers();
    expect(res).toEqual([mockRes]);
    expect(mockService.listUsers).toHaveBeenCalled();
  });

  it('should call deleteUser on the service', async () => {
    mockService.deleteUser.mockResolvedValue(mockRes);
    const res = await controller.deleteUser('');
    expect(res).toEqual(mockRes);
    expect(mockService.deleteUser).toHaveBeenCalled();
  });
});
