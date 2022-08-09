import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentMention } from './comment-mention.entity';

@Injectable()
export class CommentMentionService {
  constructor(
    @InjectRepository(CommentMention)
    private commentMentionRepository: Repository<CommentMention>,
  ) {}

  async updateMentionsOnComment(
    commentUuid: string,
    mentions: CommentMention[],
  ) {
    const commentMentions = [];
    const currentMentions = await this.getMentionsOnComment(commentUuid);

    this.commentMentionRepository.remove(currentMentions);

    for (const mention of mentions) {
      const newMention = new CommentMention();
      newMention.commentUuid = commentUuid;
      newMention.userUuid = mention.userUuid;
      newMention.mentionName = mention.mentionName;
      commentMentions.push(newMention);
    }

    await this.commentMentionRepository.save(commentMentions);
    return commentMentions;
  }

  async deleteMentionsOnComment(commentUuid: string) {
    const mentions = await this.getMentionsOnComment(commentUuid);

    await this.commentMentionRepository.softRemove(mentions);
  }

  private async getMentionsOnComment(commentUuid: string) {
    return await this.commentMentionRepository.find({
      where: { commentUuid },
    });
  }
}
