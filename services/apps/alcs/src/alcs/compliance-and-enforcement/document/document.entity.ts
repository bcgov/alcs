import { AutoMap } from 'automapper-classes';
import { BaseEntity, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DocumentCode } from '../../../document/document-code.entity';
import { Document } from '../../../document/document.entity';
import { ComplianceAndEnforcement } from '../compliance-and-enforcement.entity';

@Entity({
  comment: "Links complaint/referral documents with the complaint/referral they're saved to and logs other attributes",
})
export class ComplianceAndEnforcementDocument extends BaseEntity {
  constructor(data?: Partial<ComplianceAndEnforcementDocument>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => DocumentCode, { cascade: true })
  type?: DocumentCode;

  @ManyToOne(() => ComplianceAndEnforcement, { nullable: false })
  file: ComplianceAndEnforcement;

  @OneToOne(() => Document, { cascade: true })
  @JoinColumn()
  document: Document;
}
