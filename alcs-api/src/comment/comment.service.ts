import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindOptionsRelations } from 'typeorm/browser';
import { Application } from '../application/application.entity';
import { ApplicationService } from '../application/application.service';
import { ServiceValidationException } from '../common/exceptions/base.exception';
import { NotificationService } from '../notification/notification.service';
import { User } from '../user/user.entity';
import { Comment } from './comment.entity';
import { CommentMention } from './mention/comment-mention.entity';
import { CommentMentionService } from './mention/comment-mention.service';

@Injectable()
export class CommentService {
  private DEFAULT_COMMENT_RELATIONS: FindOptionsRelations<Comment> = {
    author: true,
    mentions: true,
  };

  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    private applicationService: ApplicationService,
    private commentMentionService: CommentMentionService,
    private notificationService: NotificationService,
  ) {}

  async fetch(fileNumber: string) {
    const application = await this.applicationService.get(fileNumber);
    return this.commentRepository.find({
      where: {
        cardUuid: application.cardUuid,
      },
      relations: this.DEFAULT_COMMENT_RELATIONS,
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
      relations: this.DEFAULT_COMMENT_RELATIONS,
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
      card: application.card,
      author,
    });

    const createComment = await this.commentRepository.save(comment);
    await this.processMentions(mentions, comment, application);

    return createComment;
  }

  async delete(uuid: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { uuid },
    });

    await this.commentRepository.softRemove([comment]);
    await this.commentMentionService.removeMentions(uuid);
    return;
  }

  async update(uuid: string, body: string, mentions: CommentMention[]) {
    const comment = await this.commentRepository.findOne({
      where: { uuid },
      relations: {
        ...this.DEFAULT_COMMENT_RELATIONS,
      },
    });
    const application = await this.applicationService.getByCard(
      comment.cardUuid,
    );

    if (body.trim() === '') {
      throw new ServiceValidationException('Comment body must be filled.');
    }

    comment.edited = true;
    comment.body = body;

    await this.commentRepository.save(comment);
    await this.processMentions(mentions, comment, application);

    return;
  }

  private async processMentions(
    mentions: CommentMention[],
    comment: Comment,
    application: Application,
  ) {
    await this.commentMentionService.updateMentions(comment.uuid, mentions);

    mentions.forEach((mention) => {
      this.notificationService.createForApplication(
        comment.author,
        mention.userUuid,
        `${comment.author.name} mentioned you in a comment`,
        application,
      );
    });
  }
}
