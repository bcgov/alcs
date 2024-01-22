import { AutoMap } from 'automapper-classes';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { OwnerType } from '../../../common/owner-type/owner-type.entity';
import { ApplicationSubmission } from '../application-submission.entity';

@Entity()
export class CovenantTransferee extends Base {
  constructor(data?: Partial<CovenantTransferee>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap(() => String)
  @Column({
    type: 'varchar',
    nullable: true,
  })
  firstName?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'varchar',
    nullable: true,
  })
  lastName?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'varchar',
    nullable: true,
  })
  organizationName?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'varchar',
    nullable: true,
  })
  phoneNumber?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'varchar',
    nullable: true,
  })
  email?: string | null;

  @AutoMap()
  @ManyToOne(() => OwnerType, { nullable: false })
  type: OwnerType;

  @ManyToOne(() => ApplicationSubmission, { nullable: false })
  applicationSubmission: ApplicationSubmission;

  @AutoMap()
  @Column()
  applicationSubmissionUuid: string;
}
