import { Entity, Column, ManyToOne } from 'typeorm';
import { Base } from '../../../../common/entities/base.entity';
import { AutoMap } from 'automapper-classes';
import { ColumnNumericTransformer } from '../../../../utils/column-numeric-transform';
import { NoticeOfIntentDecisionCondition } from '../notice-of-intent-decision-condition.entity';

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
export class NoticeOfIntentDecisionConditionFinancialInstrument extends Base {
  constructor(data?: Partial<NoticeOfIntentDecisionConditionFinancialInstrument>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @Column({ type: 'varchar', nullable: false })
  securityHolderPayee: string;

  @AutoMap()
  @Column({ type: 'enum', enum: InstrumentType, nullable: false, enumName: 'noi_instrument_type' })
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
  @Column({ type: 'enum', enum: HeldBy, nullable: false, enumName: 'noi_instrument_held_by' })
  heldBy: HeldBy;

  @AutoMap()
  @Column({ type: 'timestamptz', nullable: false })
  receivedDate: Date;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @AutoMap()
  @Column({
    type: 'enum',
    enum: InstrumentStatus,
    default: InstrumentStatus.RECEIVED,
    nullable: false,
    enumName: 'noi_instrument_status',
  })
  status: InstrumentStatus;

  @AutoMap()
  @Column({ type: 'timestamptz', nullable: true })
  statusDate?: Date | null;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  explanation?: string | null;

  @ManyToOne(() => NoticeOfIntentDecisionCondition, (condition) => condition.financialInstruments, {
    onDelete: 'CASCADE',
  })
  condition: NoticeOfIntentDecisionCondition;
}
