import { Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../../common/entities/base.code.entity';

@Entity({ comment: 'Code table for possible NOI modification review outcomes' })
export class NoticeOfIntentModificationOutcomeType extends BaseCodeEntity {}
