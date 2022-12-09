import { Column, CreateDateColumn, Entity, ManyToOne } from 'typeorm';
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
  fileKey: string;

  @Column()
  fileName: string;

  @Column()
  mimeType: string;

  @ManyToOne(() => User, (user) => user.documents, {
    nullable: true,
    eager: true,
  })
  uploadedBy?: User | null;

  @Column({ nullable: true })
  uploadedByUuid?: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  uploadedAt: Date;

  @Column()
  source: string;
}
