import { DataSource, PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';
import { ComplianceAndEnforcement } from '../../compliance-and-enforcement/compliance-and-enforcement.entity';
import { ComplianceAndEnforcementProperty } from '../../compliance-and-enforcement/property/property.entity';
import { ComplianceAndEnforcementResponsiblePartyDirector } from '../../compliance-and-enforcement/responsible-parties/responsible-party-director.entity';
import {
  ComplianceAndEnforcementResponsibleParty,
  ResponsiblePartyType,
} from '../../compliance-and-enforcement/responsible-parties/responsible-party.entity';
import { LocalGovernment } from '../../local-government/local-government.entity';

@ViewEntity({
  expression: (datasource: DataSource) =>
    datasource
      .createQueryBuilder()
      .select('cae.uuid', 'uuid')
      .addSelect('cae.file_number', 'file_number')
      .addSelect('cae.date_submitted', 'date_submitted')
      .addSelect('caep.civic_address', 'civic_address')
      .addSelect(
        `case
          when caep.ownership_type_code = 'CRWN' then true
          else false
        end`,
        'is_crown',
      )
      .addSelect(
        `array_agg(
          coalesce(
            nullif(caerp.individual_name, ''),
            nullif(caerp.organization_name, '')
          )
        )
          filter (where caerp.uuid is not null and caerp.party_type = '${ResponsiblePartyType.PROPERTY_OWNER}')`,
        'responsible_parties',
      )
      .addSelect(
        `case
          when cae.date_opened is not null and cae.date_closed is null then true
          when cae.date_opened is not null and cae.date_closed is not null then false
          else null
        end`,
        'is_open',
      )
      .addSelect('lg.name', 'local_government_name')
      .from(ComplianceAndEnforcement, 'cae')
      .leftJoin(ComplianceAndEnforcementProperty, 'caep', 'caep.file_uuid = cae.uuid')
      .leftJoin(ComplianceAndEnforcementResponsibleParty, 'caerp', 'caerp.file_uuid = cae.uuid')
      .leftJoin(
        ComplianceAndEnforcementResponsiblePartyDirector,
        'caerpd',
        'caerpd.responsible_party_uuid = caerp.uuid',
      )
      .leftJoin(LocalGovernment, 'lg', 'lg.uuid = caep.local_government_uuid')
      .groupBy('cae.uuid')
      .addGroupBy('caep.civic_address')
      .addGroupBy('caep.ownership_type_code')
      .addGroupBy('lg.name'),
})
export class ComplianceAndEnforcementSearchView {
  @ViewColumn()
  @PrimaryColumn()
  uuid: string;

  @ViewColumn()
  fileNumber: string;

  @ViewColumn()
  dateSubmitted: Date | null;

  @ViewColumn()
  civicAddress?: string;

  @ViewColumn()
  isCrown?: boolean;

  @ViewColumn()
  responsibleParties?: string[];

  @ViewColumn()
  localGovernmentName?: string;

  @ViewColumn()
  isOpen: boolean | null;
}
