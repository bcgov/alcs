import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationService } from '../../../alcs/notification/notification.service';
import { OwnerType } from '../../../common/owner-type/owner-type.entity';
import { User } from '../../../user/user.entity';
import { NotificationSubmission } from '../notification-submission.entity';
import { NotificationSubmissionService } from '../notification-submission.service';
import { NotificationTransferee } from './notification-transferee.entity';
import { NotificationTransfereeService } from './notification-transferee.service';

describe('NotificationTransfereeService', () => {
  let service: NotificationTransfereeService;
  let mockRepo: DeepMocked<Repository<NotificationTransferee>>;
  let mockTypeRepo: DeepMocked<Repository<OwnerType>>;
  let mockSubmissionService: DeepMocked<NotificationSubmissionService>;
  let mockNotificationService: DeepMocked<NotificationService>;

  beforeEach(async () => {
    mockRepo = createMock();
    mockTypeRepo = createMock();
    mockSubmissionService = createMock();
    mockNotificationService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationTransfereeService,
        {
          provide: getRepositoryToken(NotificationTransferee),
          useValue: mockRepo,
        },
        {
          provide: getRepositoryToken(OwnerType),
          useValue: mockTypeRepo,
        },
        {
          provide: NotificationSubmissionService,
          useValue: mockSubmissionService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    service = module.get<NotificationTransfereeService>(
      NotificationTransfereeService,
    );
    mockSubmissionService.update.mockResolvedValue(
      new NotificationSubmission(),
    );
    mockNotificationService.updateApplicant.mockResolvedValue();
    mockSubmissionService.getFileNumber.mockResolvedValue('file-number');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call find for find', async () => {
    mockRepo.find.mockResolvedValue([new NotificationTransferee()]);

    await service.fetchByFileId('');

    expect(mockRepo.find).toHaveBeenCalledTimes(1);
  });

  it('should load the type and then call save for create', async () => {
    mockRepo.save.mockResolvedValue(new NotificationTransferee());
    mockTypeRepo.findOneOrFail.mockResolvedValue(new OwnerType());

    await service.create(
      {
        notificationSubmissionUuid: '',
        email: '',
        phoneNumber: '',
        typeCode: '',
      },
      new NotificationSubmission(),
    );

    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    expect(mockTypeRepo.findOneOrFail).toHaveBeenCalledTimes(1);
  });

  it('should set properties and call save for update', async () => {
    const owner = new NotificationTransferee({
      firstName: 'Bruce',
      lastName: 'Wayne',
    });
    mockRepo.findOneOrFail.mockResolvedValue(owner);
    mockRepo.save.mockResolvedValue(new NotificationTransferee());
    mockRepo.find.mockResolvedValue([new NotificationTransferee()]);

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
    mockRepo.find.mockResolvedValue([new NotificationTransferee()]);

    await service.delete(new NotificationTransferee(), new User());

    expect(mockRepo.remove).toHaveBeenCalledTimes(1);
  });

  it('should call through for verify', async () => {
    mockRepo.findOneOrFail.mockResolvedValue(new NotificationTransferee());

    await service.getOwner('');

    expect(mockRepo.findOneOrFail).toHaveBeenCalledTimes(1);
  });

  it('should call through for getMany', async () => {
    mockRepo.find.mockResolvedValue([new NotificationTransferee()]);

    await service.getMany([]);

    expect(mockRepo.find).toHaveBeenCalledTimes(1);
  });

  it('should call through for save', async () => {
    mockRepo.save.mockResolvedValue(new NotificationTransferee());

    await service.save(new NotificationTransferee());

    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should call update with the first transferees last name', async () => {
    mockRepo.find.mockResolvedValue([
      new NotificationTransferee({
        firstName: 'B',
        lastName: 'A',
      }),
    ]);

    await service.updateSubmissionApplicant('', new User());

    expect(mockSubmissionService.update).toHaveBeenCalledTimes(1);
    expect(mockSubmissionService.update.mock.calls[0][1].applicant).toEqual(
      'A',
    );
    expect(mockSubmissionService.getFileNumber).toHaveBeenCalledTimes(1);
    expect(mockNotificationService.updateApplicant).toHaveBeenCalledTimes(1);
  });

  it('should call update with the first owners last name', async () => {
    const transferees = [
      new NotificationTransferee({
        firstName: 'F',
        lastName: 'B',
      }),
      new NotificationTransferee({
        firstName: 'F',
        lastName: 'A',
      }),
      new NotificationTransferee({
        firstName: 'F',
        lastName: '1',
      }),
      new NotificationTransferee({
        firstName: 'F',
        lastName: 'C',
      }),
    ];
    mockRepo.find.mockResolvedValue(transferees);

    await service.updateSubmissionApplicant('', new User());

    expect(mockSubmissionService.update).toHaveBeenCalledTimes(1);
    expect(mockSubmissionService.update.mock.calls[0][1].applicant).toEqual(
      'A et al.',
    );
    expect(mockSubmissionService.getFileNumber).toHaveBeenCalledTimes(1);
    expect(mockNotificationService.updateApplicant).toHaveBeenCalledTimes(1);
  });

  it('should call update with the number owners last name', async () => {
    const transferees = [
      new NotificationTransferee({
        firstName: '1',
        lastName: '1',
      }),
      new NotificationTransferee({
        firstName: '2',
        lastName: '2',
      }),
    ];
    mockRepo.find.mockResolvedValue(transferees);

    await service.updateSubmissionApplicant('', new User());

    expect(mockSubmissionService.update).toHaveBeenCalledTimes(1);
    expect(mockSubmissionService.update.mock.calls[0][1].applicant).toEqual(
      '1 et al.',
    );
  });
});
