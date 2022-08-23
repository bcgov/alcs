import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigModule } from '../../common/config/config.module';
import {
  initCommentMentionMock,
  initCommentMock,
} from '../../common/utils/test-helpers/mockEntities';
import {
  MockType,
  repositoryMockFactory,
} from '../../common/utils/test-helpers/mockTypes';
import { Comment } from '../comment.entity';
import { CommentMention } from './comment-mention.entity';
import { CommentMentionService } from './comment-mention.service';

describe('CommentMentionService', () => {
  let service: CommentMentionService;
  let mockCommentMentionRepository: MockType<Repository<CommentMention>>;
  let comment: Comment;

  beforeEach(async () => {
    comment = initCommentMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        CommentMentionService,
        {
          provide: getRepositoryToken(CommentMention),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    mockCommentMentionRepository = module.get(
      getRepositoryToken(CommentMention),
    );
    mockCommentMentionRepository.find.mockReturnValue([]);

    service = module.get<CommentMentionService>(CommentMentionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delete mentions on comment', async () => {
    mockCommentMentionRepository.find.mockReturnValueOnce(comment.mentions);

    await service.removeMentions(comment.uuid);
    expect(mockCommentMentionRepository.softRemove).toBeCalledTimes(1);
    expect(mockCommentMentionRepository.softRemove).toBeCalledWith(
      comment.mentions,
    );
  });

  it('should return mentions on comment', async () => {
    mockCommentMentionRepository.find.mockReturnValueOnce(comment.mentions);

    const mentions = await service.fetchMentions(comment.uuid);

    expect(mentions).toStrictEqual(comment.mentions);
  });

  it('should return empty array if no mentions attached to comment', async () => {
    mockCommentMentionRepository.find.mockReturnValueOnce([]);

    const mentions = await service.fetchMentions('uuid');

    expect(mentions).toStrictEqual([]);
  });

  it('should remove mentions if non passed', async () => {
    mockCommentMentionRepository.find.mockReturnValue([...comment.mentions]);
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
    await service.updateMentions(comment.uuid, mentions);

    expect(mockCommentMentionRepository.save).toBeCalledTimes(1);
    expect(mockCommentMentionRepository.remove).toBeCalledTimes(0);
  });

  it('should remove old mentions and attach new', async () => {
    mockCommentMentionRepository.find.mockReturnValue([...comment.mentions]);
    const mention = initCommentMentionMock();
    mention.userUuid = '2222222';
    mention.user.uuid = '2222222';

    const mentions = [mention];
    await service.updateMentions(comment.uuid, mentions);

    expect(mockCommentMentionRepository.save).toBeCalledTimes(1);
    expect(mockCommentMentionRepository.remove).toBeCalledTimes(1);
  });
});
