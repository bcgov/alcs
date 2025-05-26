import { AutoMap } from 'automapper-classes';
import { Column, Entity } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { FILE_NUMBER_SEQUENCE } from '../../file-number/file-number.constants';

export enum InitialSubmissionType {
  COMPLAINT = 'Complaint',
  REFERRAL = 'Referral',
}

export enum AllegedActivity {
  BREACH_OF_CONDITION = 'Breach of Condition',
  EXTRACTION = 'Extraction',
  FILL = 'Fill',
  NON_FARM_USE = 'Non-Farm Use',
  OTHER = 'Other',
  RESIDENCE = 'Residence',
}

@Entity({
  comment: 'Compliance and enforcement file',
})
export class ComplianceAndEnforcement extends Base {
  constructor(data?: Partial<ComplianceAndEnforcement>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @Column({
    unique: true,
    default: () => `NEXTVAL('${FILE_NUMBER_SEQUENCE}')`,
  })
  fileNumber: string;

  @AutoMap()
  @Column({ type: 'timestamptz', nullable: true })
  dateSubmitted: Date | null;

  @AutoMap()
  @Column({ type: 'timestamptz', nullable: true })
  dateOpened: Date | null;

  @AutoMap()
  @Column({ type: 'timestamptz', nullable: true })
  dateClosed: Date | null;

  @AutoMap()
  @Column({ type: 'enum', enum: InitialSubmissionType, nullable: true })
  initialSubmissionType: InitialSubmissionType | null;

  @AutoMap()
  @Column({ type: 'text', default: '' })
  allegedContraventionNarrative: string;

  @AutoMap()
  @Column({ type: 'enum', enum: AllegedActivity, array: true, default: [] })
  allegedActivity: AllegedActivity[];

  @AutoMap()
  @Column({ type: 'text', default: '' })
  intakeNotes: string;
}
