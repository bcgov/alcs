import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { Base } from '../../../../common/entities/base.entity';
import { ApplicationDecisionCondition } from '../application-decision-condition.entity';
import { AutoMap } from 'automapper-classes';
import { ColumnNumericTransformer } from '../../../../utils/column-numeric-transform';

export enum InstrumentType {
  BANK_DRAFT = 'Bank Draft',
  CERTIFIED_CHEQUE = 'Certified Cheque',
  EFT = 'EFT',
  IRREVOCABLE_LETTER_OF_CREDIT = 'Irrevocable Letter of Credit',
  OTHER = 'Other',
  SAFEKEEPING_AGREEMENT = 'Safekeeping Agreement',
}

export enum HeldBy {
  ALC = 'ALC',
  MINISTRY = 'Ministry',
}

export enum InstrumentStatus {
  RECEIVED = 'Received',
  RELEASED = 'Released',
  CASHED = 'Cashed',
  REPLACED = 'Replaced',
}

@Entity({ comment: 'Instrument for Financial Security Conditions' })
export class ApplicationDecisionConditionFinancialInstrument extends Base {
  constructor(data?: Partial<ApplicationDecisionConditionFinancialInstrument>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @Column({ type: 'varchar', nullable: false })
  securityHolderPayee: string;

  @AutoMap()
  @Column({ type: 'enum', enum: InstrumentType, nullable: false })
  type: InstrumentType;

  @AutoMap()
  @Column({ type: 'timestamptz', nullable: false })
  issueDate: Date;

  @AutoMap()
  @Column({ type: 'timestamptz', nullable: true })
  expiryDate?: Date | null;

  @AutoMap()
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: false, transformer: new ColumnNumericTransformer() })
  amount: number;

  @AutoMap()
  @Column({ type: 'varchar', nullable: false })
  bank: string;

  @AutoMap()
  @Column({ type: 'varchar', nullable: true })
  instrumentNumber: string | null;

  @AutoMap()
  @Column({ type: 'enum', enum: HeldBy, nullable: false })
  heldBy: HeldBy;

  @AutoMap()
  @Column({ type: 'timestamptz', nullable: false })
  receivedDate: Date;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @AutoMap()
  @Column({ type: 'enum', enum: InstrumentStatus, default: InstrumentStatus.RECEIVED, nullable: false })
  status: InstrumentStatus;

  @AutoMap()
  @Column({ type: 'timestamptz', nullable: true })
  statusDate?: Date | null;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  explanation?: string | null;

  @ManyToOne(() => ApplicationDecisionCondition, (condition) => condition.financialInstruments, { onDelete: 'CASCADE' })
  condition: ApplicationDecisionCondition;
}
