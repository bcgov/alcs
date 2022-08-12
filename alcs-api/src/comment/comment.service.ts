import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationService } from '../application/application.service';
import { ServiceValidationException } from '../common/exceptions/base.exception';
import { User } from '../user/user.entity';
import { Comment } from './comment.entity';
import { CommentMention } from './mention/comment-mention.entity';
import { CommentMentionService } from './mention/comment-mention.service';

const DEFAULT_COMMENT_RELATIONS = ['author', 'mentions'];
@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    private applicationService: ApplicationService,
    private commentMentionService: CommentMentionService,
  ) {}

  async fetchComments(fileNumber: string) {
    const application = await this.applicationService.get(fileNumber);
    return this.commentRepository.find({
      where: {
        applicationUuid: application.uuid,
      },
      relations: DEFAULT_COMMENT_RELATIONS,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async get(commentUuid: string) {
    return this.commentRepository.findOne({
      where: {
        uuid: commentUuid,
      },
      relations: DEFAULT_COMMENT_RELATIONS,
    });
  }

  async create(
    fileNumber: string,
    commentBody: string,
    author: User,
    mentions: CommentMention[],
  ) {
    const application = await this.applicationService.get(fileNumber);
    if (!application) {
      throw new NotFoundException('Unable to find application');
    }

    const comment = new Comment({
      body: commentBody,
      application,
      author,
    });

    const createComment = await this.commentRepository.save(comment);
    await this.commentMentionService.updateMentionsOnComment(
      createComment.uuid,
      mentions,
    );
    await this.commentMentionService.notifyRecipientsOnComment(
      comment,
      application,
    );

    return createComment;
  }

  async delete(uuid: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { uuid },
    });

    await this.commentRepository.softRemove([comment]);
    await this.commentMentionService.deleteMentionsOnComment(uuid);
    return;
  }

  async update(uuid: string, body: string, mentions: CommentMention[]) {
    const comment = await this.commentRepository.findOne({
      where: { uuid },
      relations: [...DEFAULT_COMMENT_RELATIONS, 'application'],
    });

    if (body.trim() === '') {
      throw new ServiceValidationException('Comment body must be filled.');
    }

    if (comment.body.trim() === body.trim()) {
      // do not preform update if nothing changed
      return;
    }

    comment.edited = true;
    comment.body = body;

    await this.commentRepository.save(comment);

    if (mentions) {
      const application = await this.applicationService.get(
        comment.application.fileNumber,
      );

      await this.commentMentionService.updateMentionsOnComment(
        comment.uuid,
        mentions,
      );

      await this.commentMentionService.notifyRecipientsOnComment(
        comment,
        application,
      );
    }

    return;
  }
}
