import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  initCardMockEntity,
  initCommentMock,
} from '../../../test/mocks/mockEntities';
import { Card } from '../card/card.entity';
import { CardService } from '../card/card.service';
import { NotificationService } from '../notification/notification.service';
import { User } from '../../user/user.entity';
import { Comment } from './comment.entity';
import { CommentService } from './comment.service';
import { CommentMentionService } from './mention/comment-mention.service';

describe('CommentService', () => {
  let service: CommentService;
  let mockCommentRepository: DeepMocked<Repository<Comment>>;
  let mockCommentMentionService: DeepMocked<CommentMentionService>;
  let mockNotificationService: DeepMocked<NotificationService>;
  let mockCardService: DeepMocked<CardService>;

  let comment;

  beforeEach(async () => {
    mockCommentRepository = createMock<Repository<Comment>>();
    mockCommentMentionService = createMock<CommentMentionService>();
    mockNotificationService = createMock<NotificationService>();
    mockCardService = createMock<CardService>();

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
          provide: CommentMentionService,
          useValue: mockCommentMentionService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
        { provide: CardService, useValue: mockCardService },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the fetched comments', async () => {
    mockCommentRepository.find.mockResolvedValue([comment]);

    const comments = await service.fetch('file-number');

    expect(mockCommentRepository.find).toHaveBeenCalledTimes(1);
    expect(comments.length).toEqual(1);
    expect(comments[0]).toEqual(comment);
    expect(comments[0].mentions).toEqual(comment.mentions);
  });

  it('should return the fetched comment', async () => {
    mockCommentRepository.findOne.mockResolvedValue(comment);

    const loadedComment = await service.get('comment-uuid');

    expect(mockCommentRepository.findOne).toHaveBeenCalledTimes(1);
    expect(loadedComment).toEqual(comment);
  });

  it('should save the new comment with the user and card', async () => {
    const fakeUser = {
      uuid: 'fake-user',
    };
    const fakeCard = initCardMockEntity();
    const fakeComment = {
      uuid: 'fake',
      card: fakeCard,
      cardUuid: fakeCard.uuid,
    } as Comment;
    mockCardService.getWithBoard.mockResolvedValue(fakeCard as Card);
    mockCommentRepository.save.mockResolvedValue({} as Comment);
    mockNotificationService.create.mockResolvedValue();

    await service.create(
      'file-number',
      'new-comment',
      fakeUser as User,
      '',
      comment.mentions,
    );

    expect(mockCommentRepository.save).toHaveBeenCalledTimes(1);
    const savedData = mockCommentRepository.save.mock.calls[0][0];
    expect(savedData.author).toEqual(fakeUser);
    expect(savedData.card).toEqual(fakeComment.card);
    expect(savedData.body).toEqual('new-comment');
    expect(mockCommentMentionService.updateMentions).toBeCalledTimes(1);
    expect(mockNotificationService.create).toHaveBeenCalledTimes(1);
  });

  it('should call soft remove when deleting', async () => {
    mockCommentRepository.findOne.mockResolvedValue(comment);
    mockCommentRepository.softRemove.mockResolvedValue({} as Comment);

    await service.delete('comment-uuid');

    expect(mockCommentRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockCommentRepository.softRemove).toHaveBeenCalledTimes(1);
  });

  it('should set the edited flag when editing', async () => {
    const fakeCard = initCardMockEntity();
    mockCardService.getWithBoard.mockResolvedValue(fakeCard as Card);
    mockCommentRepository.findOne.mockResolvedValue(comment);
    mockCommentRepository.save.mockResolvedValue({} as Comment);

    await service.update('comment-uuid', 'new-body', '', comment.mentions);

    expect(mockCommentRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockCommentRepository.save).toHaveBeenCalledTimes(1);
    const savedData = mockCommentRepository.save.mock.calls[0][0];
    expect(savedData.body).toEqual('new-body');
    expect(savedData.edited).toBeTruthy();
    expect(mockCommentMentionService.updateMentions).toBeCalledTimes(1);
    expect(mockNotificationService.create).toHaveBeenCalledTimes(1);
  });

  it('throw an exception when updating a comment body with empty string', async () => {
    mockCommentRepository.findOne.mockResolvedValue(comment);

    await expect(
      service.update('comment-uuid', '', '', comment.mentions),
    ).rejects.toMatchObject(
      new ServiceValidationException('Comment body must be filled.'),
    );
  });
});
