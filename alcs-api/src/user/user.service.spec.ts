import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from '../common/automapper/user.automapper.profile';
import { ServiceNotFoundException } from '../common/exceptions/base.exception';
import { initAssigneeMockEntity } from '../common/utils/test-helpers/mockEntities';
import { User } from './user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let repositoryMock = createMock<Repository<User>>();

  const email = 'bruce.wayne@gotham.com';
  const mockUser = initAssigneeMockEntity();
  mockUser.email = email;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: repositoryMock,
        },
        UserProfile,
      ],
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
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
    const users = await service.getAll();

    expect(users.length).toEqual(1);
    expect(users[0]).toEqual(mockUser);
  });

  it('should return the user by email from the repository', async () => {
    const user = await service.get(mockUser.email);

    expect(user).toStrictEqual(mockUser);
  });

  describe('createUser', () => {
    it('should save a user when user does not exist', async () => {
      repositoryMock.findOne.mockResolvedValue(undefined);

      const user = await service.create(mockUser);

      expect(user).toEqual(mockUser);
      expect(repositoryMock.save).toHaveBeenCalledTimes(1);
    });

    it('should reject if user already exists', async () => {
      await expect(service.create(mockUser)).rejects.toMatchObject(
        new Error(`Email already exists: ${mockUser.email}`),
      );
    });
  });

  describe('deleteUser', () => {
    it('should call delete user on the repository', async () => {
      await service.delete(mockUser.email);

      expect(repositoryMock.softRemove).toHaveBeenCalledTimes(1);
      expect(repositoryMock.softRemove).toHaveBeenCalledWith(mockUser);
    });

    it('should reject when user does not exist', async () => {
      repositoryMock.findOne.mockResolvedValue(undefined);

      await expect(service.delete(mockUser.email)).rejects.toMatchObject(
        new Error(`User with provided email not found ${mockUser.email}`),
      );
    });
  });

  describe('updateUser', () => {
    it('should update existing user', async () => {
      const mockUserEntity = initAssigneeMockEntity();
      mockUserEntity.settings = { favoriteBoards: ['CEO', 'SOI'] };
      mockUserEntity.email = 'some test email';

      const result = await service.update('fake-uuid', mockUserEntity);

      expect(result).toStrictEqual(mockUserEntity);
    });

    it('should fail when user does not exist', async () => {
      repositoryMock.findOne.mockResolvedValue(undefined);

      await expect(service.update('fake-uuid', mockUser)).rejects.toMatchObject(
        new ServiceNotFoundException(`User not found fake-uuid`),
      );
    });
  });
});
