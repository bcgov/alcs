import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationService } from '../../../alcs/notification/notification.service';
import { OwnerType } from '../../../common/owner-type/owner-type.entity';
import { User } from '../../../user/user.entity';
import { ApplicationSubmission } from '../application-submission.entity';
import { ApplicationSubmissionService } from '../application-submission.service';
import { CovenantTransferee } from './covenant-transferee.entity';
import { CovenantTransfereeService } from './covenant-transferee.service';

describe('CovenantTransfereeService', () => {
  let service: CovenantTransfereeService;
  let mockRepo: DeepMocked<Repository<CovenantTransferee>>;
  let mockTypeRepo: DeepMocked<Repository<OwnerType>>;
  let mockSubmissionService: DeepMocked<ApplicationSubmissionService>;
  let mockNotificationService: DeepMocked<NotificationService>;

  beforeEach(async () => {
    mockRepo = createMock();
    mockTypeRepo = createMock();
    mockSubmissionService = createMock();
    mockNotificationService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CovenantTransfereeService,
        {
          provide: getRepositoryToken(CovenantTransferee),
          useValue: mockRepo,
        },
        {
          provide: getRepositoryToken(OwnerType),
          useValue: mockTypeRepo,
        },
        {
          provide: ApplicationSubmissionService,
          useValue: mockSubmissionService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    service = module.get<CovenantTransfereeService>(CovenantTransfereeService);
    mockSubmissionService.update.mockResolvedValue(new ApplicationSubmission());
    mockNotificationService.updateApplicant.mockResolvedValue();
    mockSubmissionService.getFileNumber.mockResolvedValue('file-number');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call find for find', async () => {
    mockRepo.find.mockResolvedValue([new CovenantTransferee()]);

    await service.fetchBySubmissionUuid('');

    expect(mockRepo.find).toHaveBeenCalledTimes(1);
  });

  it('should load the type and then call save for create', async () => {
    mockRepo.save.mockResolvedValue(new CovenantTransferee());
    mockTypeRepo.findOneOrFail.mockResolvedValue(new OwnerType());
    mockRepo.find.mockResolvedValue([]);

    await service.create(
      {
        applicationSubmissionUuid: '',
        email: '',
        phoneNumber: '',
        typeCode: '',
      },
      new ApplicationSubmission(),
    );

    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    expect(mockTypeRepo.findOneOrFail).toHaveBeenCalledTimes(1);
  });

  it('should set properties and call save for update', async () => {
    const owner = new CovenantTransferee({
      firstName: 'Bruce',
      lastName: 'Wayne',
    });
    mockRepo.findOneOrFail.mockResolvedValue(owner);
    mockRepo.save.mockResolvedValue(new CovenantTransferee());
    mockRepo.find.mockResolvedValue([new CovenantTransferee()]);

    await service.update(
      '',
      {
        firstName: 'I Am',
        lastName: 'Batman',
        email: '',
        phoneNumber: '',
        typeCode: '',
      },
      new User(),
    );

    expect(owner.firstName).toEqual('I Am');
    expect(owner.lastName).toEqual('Batman');
    expect(mockRepo.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should call through for delete', async () => {
    mockRepo.remove.mockResolvedValue({} as any);
    mockRepo.find.mockResolvedValue([new CovenantTransferee()]);

    await service.delete(new CovenantTransferee());

    expect(mockRepo.remove).toHaveBeenCalledTimes(1);
  });

  it('should call through for verify', async () => {
    mockRepo.findOneOrFail.mockResolvedValue(new CovenantTransferee());

    await service.getOwner('');

    expect(mockRepo.findOneOrFail).toHaveBeenCalledTimes(1);
  });

  it('should call through for getMany', async () => {
    mockRepo.find.mockResolvedValue([new CovenantTransferee()]);

    await service.getMany([]);

    expect(mockRepo.find).toHaveBeenCalledTimes(1);
  });

  it('should call through for save', async () => {
    mockRepo.save.mockResolvedValue(new CovenantTransferee());

    await service.save(new CovenantTransferee());

    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });
});
