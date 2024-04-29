import { Column, Entity } from 'typeorm';
import { BaseCodeEntity } from '../../common/entities/base.code.entity';

@Entity({
  comment: 'Code table for possible NOI subtypes',
})
export class NoticeOfIntentSubtype extends BaseCodeEntity {
  constructor(data?: Partial<NoticeOfIntentSubtype>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @Column({ default: true })
  isActive: boolean;
}
