import { AutoMap } from 'automapper-classes';
import { Column, Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';

@Entity({ comment: 'Code table for possible Notification types' })
export class NotificationType extends BaseCodeEntity {
  constructor(data?: Partial<NotificationType>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @Column()
  shortLabel: string;

  @AutoMap()
  @Column()
  backgroundColor: string;

  @AutoMap()
  @Column()
  textColor: string;

  @AutoMap()
  @Column({ type: 'text', default: '' })
  htmlDescription: string;

  @AutoMap()
  @Column({ type: 'text', default: '' })
  portalLabel: string;
}
