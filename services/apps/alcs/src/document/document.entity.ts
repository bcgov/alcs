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

  @Column({ nullable: true })
  fileSize?: number;

  @Column()
  mimeType: string;

  @ManyToOne(() => User, (user) => user.documents, {
    nullable: true,
    eager: true,
  })
  uploadedBy?: User | null;

  @Column({ nullable: true })
  uploadedByUuid?: string | null;

  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  @CreateDateColumn({ type: 'timestamptz' })
  uploadedAt: Date;

  @Column({ default: 'ALC' })
  source: string;

  @Column({
    default: 'ALC',
    comment: 'Front-end the document was uploaded from',
  })
  system: string;

  @Column({
    nullable: true,
    type: 'text',
    comment: 'used only for oats etl process',
  })
  oatsApplicationId?: string | null;

  @Column({
    nullable: true,
    type: 'text',
    unique: true,
    comment: 'used only for oats etl process',
  })
  oatsDocumentId?: string | null;
}
