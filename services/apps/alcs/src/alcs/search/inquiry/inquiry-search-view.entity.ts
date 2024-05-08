import {
  DataSource,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  ViewColumn,
  ViewEntity,
} from 'typeorm';
import { InquiryType } from '../../inquiry/inquiry-type.entity';
import { Inquiry } from '../../inquiry/inquiry.entity';
import { LocalGovernment } from '../../local-government/local-government.entity';

@ViewEntity({
  expression: (datasource: DataSource) =>
    datasource
      .createQueryBuilder()
      .select('inquiry.uuid', 'inquiry_uuid')
      .addSelect('inquiry.file_number', 'file_number')
      .addSelect('inquiry.inquirer_first_name', 'inquirer_first_name')
      .addSelect('inquiry.inquirer_last_name', 'inquirer_last_name')
      .addSelect('inquiry.inquirer_organization', 'inquirer_organization')
      .addSelect('inquiry.type_code', 'inquiry_type_code')
      .addSelect('inquiry.open', 'open')
      .addSelect('inquiry.date_submitted_to_alc', 'date_submitted_to_alc')
      .addSelect('localGovernment.name', 'local_government_name')
      .from(Inquiry, 'inquiry')
      .innerJoinAndSelect(
        InquiryType,
        'inquiryType',
        'inquiry.type_code = inquiryType.code',
      )
      .leftJoin(
        LocalGovernment,
        'localGovernment',
        'inquiry.local_government_uuid = localGovernment.uuid',
      ),
})
export class InquirySearchView {
  @ViewColumn()
  @PrimaryColumn()
  inquiryUuid: string;

  @ViewColumn()
  fileNumber: string;

  @ViewColumn()
  inquirerFirstName?: string;

  @ViewColumn()
  inquirerLastName?: string;

  @ViewColumn()
  inquirerOrganization?: string;

  @ViewColumn()
  localGovernmentName?: string;

  @ViewColumn()
  inquiryTypeCode: string;

  @ViewColumn()
  open: boolean;

  @ViewColumn()
  dateSubmittedToAlc: Date | null;

  @ManyToOne(() => InquiryType, {
    nullable: false,
  })
  @JoinColumn({ name: 'inquiry_type_code' })
  inquiryType: InquiryType;
}
