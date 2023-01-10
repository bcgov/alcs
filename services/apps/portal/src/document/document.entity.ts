import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../common/entities/base.entity';
import { User } from '../user/user.entity';

@Entity()
export class Document extends Base {
  constructor(data?: Partial<Document>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @Column()
  alcsDocumentUuid: string;

  @Column()
  fileName: string;

  @Column()
  fileSize: number;

  @ManyToOne(() => User, {
    nullable: false,
    eager: true,
  })
  uploadedBy: User;
}
