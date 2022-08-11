import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationService } from '../application/application.service';
import { User } from '../user/user.entity';
import { Comment } from './comment.entity';
import { CommentMention } from './mention/comment-mention.entity';
import { CommentMentionService } from './mention/comment-mention.service';

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
      relations: ['author', 'mentions'],
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
      relations: ['author', 'mentions'],
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
    this.commentMentionService.updateMentionsOnComment(
      createComment.uuid,
      mentions,
    );
    this.commentMentionService.notifyRecipientsOnComment(comment, application);

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
    });

    comment.edited = true;
    comment.body = body;

    await this.commentRepository.save(comment);

    if (mentions) {
      await this.commentMentionService.updateMentionsOnComment(
        comment.uuid,
        mentions,
      );
    }

    return;
  }
}
