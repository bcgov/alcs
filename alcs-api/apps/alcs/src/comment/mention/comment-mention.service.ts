import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CONFIG_TOKEN, IConfig } from '../../common/config/config.module';
import { CommentMention } from './comment-mention.entity';

@Injectable()
export class CommentMentionService {
  constructor(
    @InjectRepository(CommentMention)
    private commentMentionRepository: Repository<CommentMention>,
    @Inject(CONFIG_TOKEN) private config: IConfig,
  ) {}

  async updateMentions(commentUuid: string, mentions: CommentMention[]) {
    const currentMentions = await this.getMentionsOnComment(commentUuid);

    await this.cleanExistingMentions(mentions, currentMentions);
    await this.addNewMentions(mentions, currentMentions, commentUuid);

    return this.getMentionsOnComment(commentUuid);
  }

  private async cleanExistingMentions(
    mentions: CommentMention[],
    currentMentions: CommentMention[],
  ) {
    if (mentions.length === 0) {
      await this.commentMentionRepository.remove(currentMentions);
      return;
    }

    const mentionsToRemove = currentMentions.filter(
      (m) => !mentions.some((cm) => cm.userUuid === m.userUuid),
    );

    if (mentionsToRemove && mentionsToRemove.length > 0) {
      await this.commentMentionRepository.remove(mentionsToRemove);
    }
    return;
  }

  private async addNewMentions(
    mentions: CommentMention[],
    currentMentions: CommentMention[],
    commentUuid: string,
  ) {
    const addedMentions: CommentMention[] = [];
    const mentionsToAdd = mentions.filter(
      (m) => !currentMentions.some((cm) => cm.userUuid === m.userUuid),
    );

    if (mentionsToAdd.length <= 0) {
      return addedMentions;
    }

    for (const mention of mentionsToAdd) {
      const newMention = new CommentMention();
      newMention.commentUuid = commentUuid;
      newMention.userUuid = mention.userUuid;
      newMention.mentionLabel = mention.mentionLabel;
      addedMentions.push(newMention);
    }

    await this.commentMentionRepository.save(addedMentions);
    return addedMentions;
  }

  async removeMentions(commentUuid: string) {
    const mentions = await this.getMentionsOnComment(commentUuid);
    await this.commentMentionRepository.softRemove(mentions);
  }

  private async getMentionsOnComment(commentUuid: string) {
    return this.commentMentionRepository.find({
      where: { commentUuid },
    });
  }

  fetchMentions(commentUuid: string) {
    return this.commentMentionRepository.find({
      where: { commentUuid: commentUuid },
      relations: ['user', 'comment'],
    });
  }
}
