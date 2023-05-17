import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '@app/common/exceptions/base.exception';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';
import { Card } from '../card/card.entity';
import { CardService } from '../card/card.service';
import { NotificationService } from '../notification/notification.service';
import { User } from '../../user/user.entity';
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
    private cardService: CardService,
    private commentMentionService: CommentMentionService,
    private notificationService: NotificationService,
  ) {}

  async fetch(cardUuid: string) {
    return this.commentRepository.find({
      where: {
        cardUuid: cardUuid,
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
    cardUuid: string,
    commentBody: string,
    author: User,
    notificationTitle: string,
    mentions: CommentMention[],
  ) {
    const card = await this.cardService.getWithBoard(cardUuid);
    if (!card) {
      throw new NotFoundException('Unable to find card');
    }

    const comment = new Comment({
      body: commentBody,
      card: card,
      author,
    });

    const createComment = await this.commentRepository.save(comment);
    await this.processMentions(mentions, comment, notificationTitle, card);

    return createComment;
  }

  async delete(uuid: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { uuid },
    });

    if (!comment) {
      throw new ServiceNotFoundException(
        `Failed to find comment with uuid ${uuid}`,
      );
    }

    await this.commentRepository.softRemove([comment]);
    await this.commentMentionService.removeMentions(uuid);
    return;
  }

  async update(
    uuid: string,
    body: string,
    notificationTitle: string,
    mentions: CommentMention[],
  ) {
    const comment = await this.commentRepository.findOne({
      where: { uuid },
      relations: {
        ...this.DEFAULT_COMMENT_RELATIONS,
      },
    });

    if (!comment) {
      throw new ServiceNotFoundException(
        `Failed to find comment with uuid ${uuid}`,
      );
    }

    if (body.trim() === '') {
      throw new ServiceValidationException('Comment body must be filled.');
    }

    comment.edited = true;
    comment.body = body;

    const card = await this.cardService.getWithBoard(comment.cardUuid);
    if (!card) {
      throw new ServiceNotFoundException(
        `Failed to find card with uuid ${comment.cardUuid}`,
      );
    }

    await this.commentRepository.save(comment);
    await this.processMentions(mentions, comment, notificationTitle, card);

    return;
  }

  private async processMentions(
    mentions: CommentMention[],
    comment: Comment,
    notificationTitle: string,
    card: Card,
  ) {
    await this.commentMentionService.updateMentions(comment.uuid, mentions);

    mentions.forEach((mention) => {
      this.notificationService.createForCard(
        comment.author,
        mention.userUuid,
        `${comment.author.name} mentioned you in a comment`,
        notificationTitle,
        card,
      );
    });
  }
}
