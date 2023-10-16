import { CONFIG_TOKEN } from '@app/common/config/config.module';
import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as config from 'config';
import { Repository } from 'typeorm';
import { initUserMockEntity } from '../../test/mocks/mockEntities';
import { LocalGovernment } from '../alcs/local-government/local-government.entity';
import { UserProfile } from '../common/automapper/user.automapper.profile';
import { EmailService } from '../providers/email/email.service';
import { User } from './user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let mockUserRepository: DeepMocked<Repository<User>>;
  let mockGovernmentRepository: DeepMocked<Repository<LocalGovernment>>;
  let emailServiceMock: DeepMocked<EmailService>;

  const email = 'bruce.wayne@gotham.com';
  const mockUser = initUserMockEntity();
  mockUser.email = email;

  beforeEach(async () => {
    emailServiceMock = createMock();
    mockUserRepository = createMock();
    mockGovernmentRepository = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(LocalGovernment),
          useValue: mockGovernmentRepository,
        },
        { provide: EmailService, useValue: emailServiceMock },
        UserProfile,
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

    mockUserRepository = module.get(getRepositoryToken(User));
    service = module.get<UserService>(UserService);

    mockUserRepository.findOne.mockResolvedValue(mockUser);
    mockUserRepository.save.mockResolvedValue(mockUser);
    mockUserRepository.find.mockResolvedValue([mockUser]);
    mockUserRepository.softRemove.mockResolvedValue(mockUser);

    emailServiceMock.sendEmail.mockResolvedValue(true);
  });

  it('should return the users from the repository', async () => {
    const users = await service.getAssignableUsers();

    expect(users.length).toEqual(1);
    expect(users[0]).toEqual(mockUser);
  });

  it('should return the user by uuid from the repository', async () => {
    const user = await service.getByUuid(mockUser.uuid);

    expect(user).toStrictEqual(mockUser);
  });

  describe('createUser', () => {
    it('should save a user when user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const user = await service.create(mockUser);

      expect(user).toEqual(mockUser);
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should reject if user already exists', async () => {
      await expect(service.create(mockUser)).rejects.toMatchObject(
        new Error(`User already exists in the system`),
      );
    });
  });

  describe('deleteUser', () => {
    it('should call delete user on the repository', async () => {
      await service.delete(mockUser.uuid);

      expect(mockUserRepository.softRemove).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.softRemove).toHaveBeenCalledWith(mockUser);
    });

    it('should reject when user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(mockUser.uuid)).rejects.toMatchObject(
        new Error(`User with provided uuid ${mockUser.uuid} was not found`),
      );
    });
  });

  describe('updateUser', () => {
    it('should update existing user', async () => {
      const mockUserEntity = initUserMockEntity();
      mockUserEntity.settings = { favoriteBoards: ['CEO', 'SOI'] };
      mockUserEntity.email = 'some test email';

      const result = await service.update('fake-uuid', mockUserEntity);

      expect(result).toStrictEqual(mockUserEntity);
    });

    it('should fail when user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.update('fake-uuid', mockUser)).rejects.toMatchObject(
        new ServiceNotFoundException(`User not found fake-uuid`),
      );
    });
  });

  it('should call emailService with correct parameters on new user request', async () => {
    const userIdentifier = mockUser.displayName;
    const env = config.get('ENV');
    const prefix = env === 'production' ? '' : `[${env}]`;
    const subject = `${prefix} Access Requested to ALCS`;
    const body = `A new user ${email}: ${userIdentifier} has requested access to ALCS.<br/> 
<a href='https://bcgov.github.io/sso-requests/my-dashboard/integrations'>CSS</a>`;

    await service.sendNewUserRequestEmail(email, userIdentifier);

    expect(emailServiceMock.sendEmail).toBeCalledWith({
      to: config.get('EMAIL.DEFAULT_ADMINS'),
      body,
      subject,
    });
  });

  it('should not call repository if user does not have a bc business guid', async () => {
    mockGovernmentRepository.findOne.mockResolvedValue(new LocalGovernment());

    const res = await service.getUserLocalGovernment(new User());

    expect(res).toBeNull();
    expect(mockGovernmentRepository.findOne).toHaveBeenCalledTimes(0);
  });

  it('should call repository if user has a bc business guid', async () => {
    mockGovernmentRepository.findOne.mockResolvedValue(new LocalGovernment());

    const res = await service.getUserLocalGovernment(
      new User({
        bceidBusinessGuid: 'guid',
      }),
    );

    expect(res).toBeDefined();
    expect(mockGovernmentRepository.findOne).toHaveBeenCalledTimes(1);
  });
});
