import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MockType, repositoryMockFactory } from '../common/utils/mockTypes';
import { User } from './user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let repositoryMock: MockType<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    repositoryMock = module.get(getRepositoryToken(User));
    service = module.get<UserService>(UserService);
  });

  it('should return the roles if user exists', async () => {
    const mockUser = {
      roles: ['batman'],
    };
    repositoryMock.findOne.mockReturnValue(mockUser);

    const roles = await service.getUserRoles('bruce.wayne@gotham.com');
    expect(roles.length).toBe(1);
    expect(roles[0]).toBe('batman');
  });

  it('should return empty roles if the user does not exist', async () => {
    const mockUser = undefined;
    repositoryMock.findOne.mockReturnValue(mockUser);

    const roles = await service.getUserRoles('bruce.wayne@gotham.com');
    expect(roles.length).toBe(0);
  });
});
