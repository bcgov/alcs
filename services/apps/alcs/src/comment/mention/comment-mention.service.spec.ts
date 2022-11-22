import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigModule } from '../../common/config/config.module';
import {
  initCommentMentionMock,
  initCommentMock,
} from '../../../test/mocks/mockEntities';
import { Comment } from '../comment.entity';
import { CommentMention } from './comment-mention.entity';
import { CommentMentionService } from './comment-mention.service';

describe('CommentMentionService', () => {
  let service: CommentMentionService;
  let mockCommentMentionRepository: DeepMocked<Repository<CommentMention>>;
  let comment: Comment;

  beforeEach(async () => {
    comment = initCommentMock();
    mockCommentMentionRepository = createMock<Repository<CommentMention>>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        CommentMentionService,
        {
          provide: getRepositoryToken(CommentMention),
          useValue: mockCommentMentionRepository,
        },
      ],
    }).compile();
    mockCommentMentionRepository.find.mockResolvedValue([]);

    service = module.get<CommentMentionService>(CommentMentionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delete mentions on comment', async () => {
    mockCommentMentionRepository.find.mockResolvedValueOnce(comment.mentions);
    mockCommentMentionRepository.softRemove.mockResolvedValue({} as any);

    await service.removeMentions(comment.uuid);
    expect(mockCommentMentionRepository.softRemove).toBeCalledTimes(1);
    expect(mockCommentMentionRepository.softRemove).toBeCalledWith(
      comment.mentions,
    );
  });

  it('should return mentions on comment', async () => {
    mockCommentMentionRepository.find.mockResolvedValueOnce(comment.mentions);

    const mentions = await service.fetchMentions(comment.uuid);

    expect(mentions).toStrictEqual(comment.mentions);
  });

  it('should return empty array if no mentions attached to comment', async () => {
    mockCommentMentionRepository.find.mockResolvedValueOnce([]);

    const mentions = await service.fetchMentions('uuid');

    expect(mentions).toStrictEqual([]);
  });

  it('should remove mentions if non passed', async () => {
    mockCommentMentionRepository.find.mockResolvedValue(comment.mentions);
    mockCommentMentionRepository.remove.mockResolvedValue({} as any);

    const mentions = [];
    await service.updateMentions(comment.uuid, mentions);

    expect(mockCommentMentionRepository.save).toBeCalledTimes(0);
    expect(mockCommentMentionRepository.remove).toBeCalledTimes(1);
    expect(mockCommentMentionRepository.remove).toBeCalledWith(
      comment.mentions,
    );
  });

  it('should keep existing mentions if nothing changed', async () => {
    const mentions = [...comment.mentions];
    mockCommentMentionRepository.save.mockResolvedValue(mentions as any);

    await service.updateMentions(comment.uuid, mentions);

    expect(mockCommentMentionRepository.save).toBeCalledTimes(1);
    expect(mockCommentMentionRepository.remove).toBeCalledTimes(0);
  });

  it('should remove old mentions and attach new', async () => {
    const mention = initCommentMentionMock();
    mention.userUuid = '2222222';
    mention.user.uuid = '2222222';

    const mentions = [mention];

    mockCommentMentionRepository.find.mockResolvedValueOnce(comment.mentions);
    mockCommentMentionRepository.remove.mockResolvedValue({} as any);
    mockCommentMentionRepository.save.mockResolvedValue(mentions as any);

    await service.updateMentions(comment.uuid, mentions);

    expect(mockCommentMentionRepository.save).toBeCalledTimes(1);
    expect(mockCommentMentionRepository.remove).toBeCalledTimes(1);
  });
});
