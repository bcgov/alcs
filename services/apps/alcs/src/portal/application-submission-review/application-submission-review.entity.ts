import { AutoMap } from '@automapper/classes';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { Application } from '../../alcs/application/application.entity';
import { Base } from '../../common/entities/base.entity';

@Entity()
export class ApplicationSubmissionReview extends Base {
  constructor(data?: Partial<ApplicationSubmissionReview>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  localGovernmentFileNumber: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  firstName: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  lastName: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  position: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  department: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  phoneNumber: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  email: string | null;

  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  isOCPDesignation: boolean | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  OCPBylawName: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  OCPDesignation: string | null;

  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  OCPConsistent: boolean | null;

  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  isSubjectToZoning: boolean | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  zoningBylawName: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  zoningDesignation: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  zoningMinimumLotSize: string | null;

  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  isZoningConsistent: boolean | null;

  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  isAuthorized: boolean | null;

  @AutoMap()
  @Column()
  applicationFileNumber: string;

  @AutoMap(() => Application)
  @OneToOne(
    () => Application,
    (application) => application.submittedApplicationReview,
  )
  @JoinColumn({
    name: 'application_file_number',
    referencedColumnName: 'fileNumber',
  })
  application: Application;
}
