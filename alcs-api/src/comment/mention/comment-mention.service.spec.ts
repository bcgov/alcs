import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as config from 'config';
import { Repository } from 'typeorm';
import { Application } from '../../application/application.entity';
import { ConfigModule } from '../../common/config/config.module';
import {
  initApplicationMockEntity,
  initCommentMentionMock,
  initCommentMock,
} from '../../common/utils/test-helpers/mockEntities';
import {
  MockType,
  repositoryMockFactory,
} from '../../common/utils/test-helpers/mockTypes';
import { EmailService } from '../../providers/email/email.service';
import { Comment } from '../comment.entity';
import { CommentMention } from './comment-mention.entity';
import { CommentMentionService } from './comment-mention.service';

describe('CommentMentionService', () => {
  let service: CommentMentionService;
  let mockEmailService: DeepMocked<EmailService>;
  let mockCommentMentionRepository: MockType<Repository<CommentMention>>;
  let comment: Comment;
  let application: Application;

  beforeEach(async () => {
    mockEmailService = createMock<EmailService>();
    comment = initCommentMock();
    application = initApplicationMockEntity();

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        CommentMentionService,
        {
          provide: getRepositoryToken(CommentMention),
          useFactory: repositoryMockFactory,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    mockCommentMentionRepository = module.get(
      getRepositoryToken(CommentMention),
    );
    mockCommentMentionRepository.find.mockReturnValue([]);

    mockEmailService.sendEmail.mockResolvedValue();

    service = module.get<CommentMentionService>(CommentMentionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delete mentions on comment', async () => {
    mockCommentMentionRepository.find.mockReturnValueOnce(comment.mentions);

    await service.removeMentionsOnComment(comment.uuid);
    expect(mockCommentMentionRepository.softRemove).toBeCalledTimes(1);
    expect(mockCommentMentionRepository.softRemove).toBeCalledWith(
      comment.mentions,
    );
  });

  it('should return mentions on comment', async () => {
    mockCommentMentionRepository.find.mockReturnValueOnce(comment.mentions);

    const mentions = await service.fetchMentionsForComment(comment.uuid);

    expect(mentions).toStrictEqual(comment.mentions);
  });

  it('should return empty array if no mentions attached to comment', async () => {
    mockCommentMentionRepository.find.mockReturnValueOnce([]);

    const mentions = await service.fetchMentionsForComment('uuid');

    expect(mentions).toStrictEqual([]);
  });

  it('should notify recipients if mentions not empty', async () => {
    mockCommentMentionRepository.find.mockReturnValue([...comment.mentions]);
    const subject = `You've been tagged on ${application.fileNumber}(${application.applicant})`;
    const to = comment.mentions.map((m) => m.user.email);
    const frontEndUrl = config.get('FRONTEND_ROOT');
    const body = `${comment.author.name} has tagged you on the card for <a href="${frontEndUrl}/admin?app=${application.fileNumber}">${application.fileNumber}(${application.applicant})</a>. <br/>
    "${comment.body}"`;

    await service.notifyRecipientsOnComment(comment, application);

    expect(mockEmailService.sendEmail).toBeCalledTimes(1);
    expect(mockEmailService.sendEmail).toBeCalledWith({ subject, to, body });
  });

  it('should not notify recipients if mentions are empty', async () => {
    comment.mentions = [];
    await service.notifyRecipientsOnComment(comment, application);

    expect(mockEmailService.sendEmail).toBeCalledTimes(0);
  });

  it('should remove mentions if non passed', async () => {
    mockCommentMentionRepository.find.mockReturnValue([...comment.mentions]);
    const mentions = [];
    await service.updateMentionsOnComment(comment.uuid, mentions);

    expect(mockCommentMentionRepository.save).toBeCalledTimes(0);
    expect(mockCommentMentionRepository.remove).toBeCalledTimes(1);
    expect(mockCommentMentionRepository.remove).toBeCalledWith(
      comment.mentions,
    );
  });

  it('should keep existing mentions if nothing changed', async () => {
    const mentions = [...comment.mentions];
    await service.updateMentionsOnComment(comment.uuid, mentions);

    expect(mockCommentMentionRepository.save).toBeCalledTimes(1);
    expect(mockCommentMentionRepository.remove).toBeCalledTimes(0);
  });

  it('should remove old mentions and attach new', async () => {
    mockCommentMentionRepository.find.mockReturnValue([...comment.mentions]);
    const mention = initCommentMentionMock();
    mention.userUuid = '2222222';
    mention.user.uuid = '2222222';

    const mentions = [mention];
    await service.updateMentionsOnComment(comment.uuid, mentions);

    expect(mockCommentMentionRepository.save).toBeCalledTimes(1);
    expect(mockCommentMentionRepository.remove).toBeCalledTimes(1);
  });
});
