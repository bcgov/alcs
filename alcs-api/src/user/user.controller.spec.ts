import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { RoleGuard } from '../common/authorization/role.guard';
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
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockService,
        },
      ],
    }).compile();

    mockRes = {
      email: 'bruce@wayne.com',
    };

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call createUser on the service', async () => {
    mockService.createUser.mockResolvedValue(mockRes);
    const res = await controller.createUser(mockRes);
    expect(res).toEqual(mockRes);
    expect(mockService.createUser).toHaveBeenCalled();
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
