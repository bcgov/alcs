import { Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';

@Entity({
  comment: 'Decision Component Types Code Table for Notice of Intents',
})
export class NoticeOfIntentDecisionComponentType extends BaseCodeEntity {
  constructor(data?: Partial<NoticeOfIntentDecisionComponentType>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
