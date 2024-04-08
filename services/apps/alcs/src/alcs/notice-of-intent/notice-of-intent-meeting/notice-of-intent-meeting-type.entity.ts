import { Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';

@Entity({
  comment: 'Code table for possible action types that un/pause NOIs',
})
export class NoticeOfIntentMeetingType extends BaseCodeEntity {}
