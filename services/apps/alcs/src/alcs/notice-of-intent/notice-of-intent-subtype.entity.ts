import { Column, Entity } from 'typeorm';
import { BaseCodeEntity } from '../../common/entities/base.code.entity';

@Entity()
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
