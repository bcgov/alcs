import { createMock } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let repositoryMock = createMock<Repository<User>>();

  const email = 'bruce.wayne@gotham.com';
  const mockUser: User = {
    email,
  } as unknown as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    repositoryMock = module.get(getRepositoryToken(User));
    service = module.get<UserService>(UserService);

    repositoryMock.findOne.mockResolvedValue(mockUser);
    repositoryMock.save.mockResolvedValue(mockUser);
    repositoryMock.find.mockResolvedValue([mockUser]);
    repositoryMock.softRemove.mockResolvedValue(mockUser);
  });

  it('should return the users from the repository', async () => {
    const users = await service.listUsers();

    expect(users.length).toEqual(1);
    expect(users[0]).toEqual(mockUser);
  });

  describe('createUser', () => {
    it('should save a user when user does not exist', async () => {
      repositoryMock.findOne.mockResolvedValue(undefined);

      const user = await service.createUser(mockUser);

      expect(user).toEqual(mockUser);
      expect(repositoryMock.save).toHaveBeenCalled();
    });

    it('should reject if user already exists', async () => {
      await expect(service.createUser(mockUser)).rejects.toMatchObject(
        new Error(`Email already exists: ${mockUser.email}`),
      );
    });
  });

  describe('deleteUser', () => {
    it('should call delete user on the repository', async () => {
      await service.deleteUser(mockUser.email);

      expect(repositoryMock.softRemove).toHaveBeenCalled();
      expect(repositoryMock.softRemove).toHaveBeenCalledWith(mockUser);
    });

    it('should reject when user does not exist', async () => {
      repositoryMock.findOne.mockResolvedValue(undefined);

      await expect(service.deleteUser(mockUser.email)).rejects.toMatchObject(
        new Error('User not found'),
      );
    });
  });
});
