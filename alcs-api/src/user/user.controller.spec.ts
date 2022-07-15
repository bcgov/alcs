import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

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
      roles: [],
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

  it('should call setUserRoles on the service', async () => {
    mockService.setUserRoles.mockResolvedValue(mockRes);
    const res = await controller.setUserRoles(mockRes);
    expect(res).toEqual(mockRes);
    expect(mockService.setUserRoles).toHaveBeenCalled();
  });

  it('should call deleteUser on the service', async () => {
    mockService.deleteUser.mockResolvedValue(mockRes);
    const res = await controller.deleteUser('');
    expect(res).toEqual(mockRes);
    expect(mockService.deleteUser).toHaveBeenCalled();
  });
});
