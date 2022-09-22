import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../application/application.entity';
import { ApplicationService } from '../application/application.service';
import { ServiceValidationException } from '../common/exceptions/base.exception';
import {
  initCardMockEntity,
  initCommentMock,
} from '../common/utils/test-helpers/mockEntities';
import { NotificationService } from '../notification/notification.service';
import { User } from '../user/user.entity';
import { Comment } from './comment.entity';
import { CommentService } from './comment.service';
import { CommentMentionService } from './mention/comment-mention.service';

describe('CommentService', () => {
  let service: CommentService;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockCommentRepository: DeepMocked<Repository<Comment>>;
  let mockCommentMentionService: DeepMocked<CommentMentionService>;
  let mockNotificationService: DeepMocked<NotificationService>;

  let comment;

  beforeEach(async () => {
    mockCommentRepository = createMock<Repository<Comment>>();
    mockApplicationService = createMock<ApplicationService>();
    mockCommentMentionService = createMock<CommentMentionService>();
    mockNotificationService = createMock<NotificationService>();

    mockCommentMentionService.updateMentions.mockResolvedValue([]);
    mockCommentMentionService.removeMentions.mockResolvedValue();

    comment = initCommentMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentRepository,
        },
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
        {
          provide: CommentMentionService,
          useValue: mockCommentMentionService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the fetched comments', async () => {
    mockApplicationService.get.mockResolvedValue({} as Application);
    mockCommentRepository.find.mockResolvedValue([comment]);

    const comments = await service.fetch('file-number');

    expect(mockApplicationService.get).toHaveBeenCalled();
    expect(mockCommentRepository.find).toHaveBeenCalled();
    expect(comments.length).toEqual(1);
    expect(comments[0]).toEqual(comment);
    expect(comments[0].mentions).toEqual(comment.mentions);
  });

  it('should return the fetched comment', async () => {
    mockCommentRepository.findOne.mockResolvedValue(comment);

    const loadedComment = await service.get('comment-uuid');

    expect(mockCommentRepository.findOne).toHaveBeenCalled();
    expect(loadedComment).toEqual(comment);
  });

  it('should save the new comment with the user and application', async () => {
    const fakeUser = {
      uuid: 'fake-user',
    };
    const fakeApplication = {
      uuid: 'fake-application',
      card: initCardMockEntity(),
    };
    mockApplicationService.get.mockResolvedValue(
      fakeApplication as Application,
    );
    mockCommentRepository.save.mockResolvedValue({} as Comment);

    await service.create(
      'file-number',
      'new-comment',
      fakeUser as User,
      comment.mentions,
    );

    expect(mockCommentRepository.save).toHaveBeenCalled();
    const savedData = mockCommentRepository.save.mock.calls[0][0];
    expect(savedData.author).toEqual(fakeUser);
    expect(savedData.card).toEqual(fakeApplication.card);
    expect(savedData.body).toEqual('new-comment');
    expect(mockCommentMentionService.updateMentions).toBeCalledTimes(1);
    expect(mockNotificationService.createForApplication).toHaveBeenCalled();
  });

  it('throw an exception when saving a comment to a non-existing application', async () => {
    mockApplicationService.get.mockResolvedValue(undefined);

    await expect(
      service.create(
        'file-number',
        'new-comment',
        {} as User,
        comment.mentions,
      ),
    ).rejects.toMatchObject(new Error(`Unable to find application`));

    expect(mockNotificationService.createForApplication).not.toHaveBeenCalled();
  });

  it('should call soft remove when deleting', async () => {
    mockCommentRepository.findOne.mockResolvedValue(comment);
    mockCommentRepository.softRemove.mockResolvedValue({} as Comment);

    await service.delete('comment-uuid');

    expect(mockCommentRepository.findOne).toHaveBeenCalled();
    expect(mockCommentRepository.softRemove).toHaveBeenCalled();
  });

  it('should set the edited flag when editing', async () => {
    mockCommentRepository.findOne.mockResolvedValue(comment);
    mockCommentRepository.save.mockResolvedValue({} as Comment);
    mockApplicationService.getByCard.mockResolvedValue({} as Application);

    await service.update('comment-uuid', 'new-body', comment.mentions);

    expect(mockCommentRepository.findOne).toHaveBeenCalled();
    expect(mockCommentRepository.save).toHaveBeenCalled();
    const savedData = mockCommentRepository.save.mock.calls[0][0];
    expect(savedData.body).toEqual('new-body');
    expect(savedData.edited).toBeTruthy();
    expect(mockCommentMentionService.updateMentions).toBeCalledTimes(1);
    expect(mockNotificationService.createForApplication).toHaveBeenCalled();
  });

  it('throw an exception when updating a comment body with empty string', async () => {
    mockCommentRepository.findOne.mockResolvedValue(comment);

    await expect(
      service.update('comment-uuid', '', comment.mentions),
    ).rejects.toMatchObject(
      new ServiceValidationException('Comment body must be filled.'),
    );
  });
});
