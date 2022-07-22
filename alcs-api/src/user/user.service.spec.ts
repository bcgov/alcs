import { createMock } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AUTH_ROLE } from '../common/enum';
import { User } from './user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let repositoryMock = createMock<Repository<User>>();

  const email = 'bruce.wayne@gotham.com';
  const mockUser: User = {
    email,
    roles: [AUTH_ROLE.ADMIN],
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

  describe('getUserRoles', () => {
    it('should return the roles if user exists', async () => {
      const roles = await service.getUserRoles(email);

      expect(roles.length).toEqual(1);
      expect(roles[0]).toEqual(AUTH_ROLE.ADMIN);
    });

    it('should return empty roles if the user does not exist', async () => {
      repositoryMock.findOne.mockReturnValue(undefined);

      const roles = await service.getUserRoles(email);

      expect(roles.length).toEqual(0);
    });
  });

  describe('createUser', () => {
    it('should save a user when valid roles are passed and user does not exist', async () => {
      repositoryMock.find.mockResolvedValue(undefined);

      const user = await service.createUser(mockUser);

      expect(user).toEqual(mockUser);
      expect(repositoryMock.save).toHaveBeenCalled();
    });

    it("should reject when user doesn't exist and invalid roles are passed to create", async () => {
      repositoryMock.find.mockResolvedValue(undefined);

      await expect(
        service.createUser({ ...mockUser, roles: ['TEAPOT'] }),
      ).rejects.toMatchObject(new Error('Provided roles do not exist'));
    });

    it('should reject if user already exists', async () => {
      await expect(service.createUser(mockUser)).rejects.toMatchObject(
        new Error('Email already exists'),
      );
    });
  });

  describe('setUserRoles', () => {
    it('should update a users roles', async () => {
      const clonedUser = {
        ...mockUser,
        roles: [AUTH_ROLE.ADMIN],
      };
      const newRoles = [AUTH_ROLE.LUP];
      repositoryMock.findOne.mockResolvedValue(clonedUser as User);

      await service.setUserRoles(mockUser.email, newRoles);

      expect(clonedUser.roles).toEqual(newRoles);
      expect(repositoryMock.save).toHaveBeenCalled();
    });

    it('should reject when invalid roles are passed', async () => {
      await expect(
        service.setUserRoles(mockUser.email, ['TEAPOT']),
      ).rejects.toMatchObject(new Error('Provided roles do not exist'));
    });

    it('should reject when user does not exist', async () => {
      repositoryMock.findOne.mockResolvedValue(undefined);

      await expect(
        service.setUserRoles(mockUser.email, mockUser.roles),
      ).rejects.toMatchObject(new Error('User not found'));
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
