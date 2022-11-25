import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as config from 'config';
import { Repository } from 'typeorm';
import { UserProfile } from '../common/automapper/user.automapper.profile';
import { CONFIG_TOKEN } from '../common/config/config.module';
import { ServiceNotFoundException } from '../common/exceptions/base.exception';
import { User } from './user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let repositoryMock = createMock<Repository<User>>();

  const email = 'bruce.wayne@gotham.com';
  const mockUser = new User({});
  mockUser.email = email;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        UserProfile,
        {
          provide: getRepositoryToken(User),
          useValue: repositoryMock,
        },
        {
          provide: CONFIG_TOKEN,
          useValue: config,
        },
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

  it('should return the user by uuid from the repository', async () => {
    const user = await service.getByUuid(mockUser.uuid);

    expect(user).toStrictEqual(mockUser);
  });

  describe('createUser', () => {
    it('should save a user when user does not exist', async () => {
      repositoryMock.findOne.mockResolvedValue(null);

      const user = await service.create(mockUser);

      expect(user).toEqual(mockUser);
      expect(repositoryMock.save).toHaveBeenCalledTimes(1);
    });

    it('should reject if user already exists', async () => {
      await expect(service.create(mockUser)).rejects.toMatchObject(
        new Error(`User already exists in the system`),
      );
    });
  });

  describe('updateUser', () => {
    it('should update existing user', async () => {
      const mockUserEntity = new User();
      mockUserEntity.email = 'some test email';

      const result = await service.update('fake-uuid', mockUserEntity);

      expect(result).toStrictEqual(mockUserEntity);
    });

    it('should fail when user does not exist', async () => {
      repositoryMock.findOne.mockResolvedValue(null);

      await expect(service.update('fake-uuid', mockUser)).rejects.toMatchObject(
        new ServiceNotFoundException(`User not found fake-uuid`),
      );
    });
  });
});
