import { MigrationInterface, QueryRunner } from 'typeorm';

export class MissedChaseInquiriesEtl1724368028724
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DO $$
        BEGIN
            IF EXISTS (SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'oats') THEN
                insert into alcs.inquiry (
                    audit_created_by,
                    summary,
                    date_submitted_to_alc,
                    inquirer_first_name,
                    inquirer_last_name,
                    inquirer_organization,
                    inquirer_phone,
                    inquirer_email,
                    "open",
                    closed_date,
                    local_government_uuid,
                    region_code,
                    type_code,
                    closed_by_uuid,
                    file_number
                )
                select
                    --null											audit_deleted_date_at
                    --auto											audit_created_at
                    --auto											audit_updated_at
                    'oats_etl'::varchar 							as audit_created_by,
                    --null											audit_updated_by
                    --auto											uuid
                    oi.description::text 							as summary,
                    oi.received_date at time zone 'America/Vancouver'   as date_submitted_to_alc,
                    filer_person.first_name::varchar				as inquirer_first_name,
                    filer_person.last_name::text 					as inquirer_last_name,
                    coalesce(
                        filer_org.organization_name,
                        filer_org.alias_name
                    )::text 										as inquirer_organization,
                    filer_pog.phone_number::text 					as inquirer_phone,
                    filer_pog.email_address::text 					as inquirer_email,
                    false											as "open",
                    '0001-01-01 00:00:00.000 -0800'::timestamptz	as closed_date,
                    lg."uuid"										as local_government_uuid,
                    lg.preferred_region_code						as region_code,
                    case
                        when oi.inquiry_code = 'INQINV' then 'INVN'
                        when oi.inquiry_code in ('GENERAL', 'AREAOI') then 'GENC'
                        when oi.inquiry_code = 'COMPLAN' then'REFR'
                    end												as type_code,
                    --null											card_uuid
                    'ca8e91dc-cfb0-45c3-a443-8e47e44591df'::uuid 	as closed_by_uuid,
                    oi.issue_id::varchar 							as file_number
                    --null											legacy_id
                from		oats.oats_issues oi
                --Gov
                join		oats.oats_person_organizations gov_pog		on	gov_pog.person_organization_id = oi.local_gov_pog_id
                join    	oats.oats_organizations gov					on  gov.organization_id = gov_pog.organization_id
                join 		alcs.local_government lg 					on  lower(trim(lg.name)) = lower(trim(gov.organization_name))
                --Filer
                join		oats.oats_person_organizations filer_pog	on  filer_pog.person_organization_id = oi.filed_by_pog_id
                left join 	oats.oats_persons filer_person 				on  filer_person.person_id = filer_pog.person_id
                left join 	oats.oats_organizations filer_org 			on  filer_org.organization_id = filer_pog.organization_id
                where   	gov.organization_name = 'VILLAGE OF CHASE'
                and 		oi.issu_type = 'INQ'
            END IF;
        END $$;
    `);

    await queryRunner.query(`
        DO $$
        BEGIN
            IF EXISTS (SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'oats') THEN
                insert into alcs.document (
                    audit_created_by,
                    file_name,
                    mime_type,
                    file_key,
                    tags,	
                    source,
                    oats_document_id,
                    system,
                    oats_issue_id
                )
                select
                    --autogen																			uuid
                    --null																				audit_deleted_date_at
                    --autogen																			audit_created_at
                    --autogen																			audit_updated_at
                    'oats_etl'																			as audit_created_by,
                    --null																				audit_updated_by
                    od.file_name,
                    case
                        when od.file_name like '%.%' then case
                            when substring(od.file_name from '\.([^\.]*)$') = 'pdf' then 'application/pdf'
                            else 'application/octet-stream'
                        end
                        else null
                    end::varchar																		as mime_type,
                    --audogen																			uploaded_at
                    --null																				uploaded_by_uuid
                    'migrate/issue/' || oi.issue_id || '/' || od.document_id || '_' || od.file_name 	as file_key,
                    '{"ORCS Classification: 85000"}'::text []											as tags,
                    case
                        when od.document_source_code = 'APP' then 'Applicant'
                        when od.document_source_code = 'LG' then 'L/FNG'
                        when od.document_source_code = 'ALC' then 'ALC'
                    end::varchar																		as source,
                    --null																				file_size
                    --null																				oats_application_id
                    od.document_id::text																as oats_document_id,
                    case
                        when od.who_created in ('PROXY_OATS_LOCGOV', 'PROXY_OATS_APPLICANT')
                        then 'OATS_P'
                        else 'OATS'
                    end::varchar																		as system,
                    --null																				oats_planning_review_id
                    od.issue_id::text																	as oats_issue_id
                from		oats.oats_issues oi
                join		oats.oats_person_organizations opo	on opo.person_organization_id = oi.local_gov_pog_id
                join		oats.oats_organizations	oo			on oo.organization_id = opo.organization_id
                join 		oats.oats_documents od				on od.issue_id = oi.issue_id
                join 		alcs.document_code dc 				on dc.oats_code = od.document_code 
                join 		alcs.inquiry i 						on i.file_number = oi.issue_id::varchar
                where		oo.organization_name = 'VILLAGE OF CHASE'
                and			oi.issu_type = 'INQ'
            END IF;
        END $$;
    `);

    await queryRunner.query(`
        DO $$
        BEGIN
            IF EXISTS (SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'oats') THEN
                insert into alcs.inquiry_document (
                    type_code,
                    inquiry_uuid,
                    document_uuid,
                    oats_document_id,
                    oats_issue_id,
                    audit_created_by
                )
                select
                    --autogen											uuid
                    dc.code												as type_code,
                    i."uuid"											as inquiry_uuid,
                    d."uuid" 											as document_uuid,
                    d.oats_document_id, 								--oats_document_id
                    d.oats_issue_id,									--oats_issue_id
                    'oats_etl'											as audit_created_by 
                from		oats.oats_issues oi
                join		oats.oats_person_organizations opo	on opo.person_organization_id = oi.local_gov_pog_id
                join		oats.oats_organizations	oo			on oo.organization_id = opo.organization_id
                join 		oats.oats_documents od				on od.issue_id = oi.issue_id
                join 		alcs.document_code dc 				on dc.oats_code = od.document_code 
                join 		alcs.inquiry i 						on i.file_number = oi.issue_id::varchar
                join		alcs."document" d 					on d.oats_document_id = od.document_id::varchar 
                where		oo.organization_name = 'VILLAGE OF CHASE'
                and			oi.issu_type = 'INQ'
             END IF;
        END $$;
    `);

    await queryRunner.query(`
        DO $$
        BEGIN
            IF EXISTS (SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'oats') THEN
                insert into alcs.inquiry_parcel (
                    audit_created_by,
                    pid,
                    pin,
                    civic_address,
                    inquiry_uuid,
                    oats_subject_property_id,
                    oats_property_id
                )
                select
                    --null																as audit_deleted_date_at,
                    --auto																as audit_created_at,
                    --auto																as audit_updated_at,
                    'oats_etl'															as audit_created_by,
                    --null																as audit_updated_by,
                    --auto																as uuid,
                    lpad(op.pid::text, 9, '0')											as pid,
                    op.pin																as pin,
                    coalesce(op.civic_address, 'No data found in OATS')::varchar		as civic_address,
                    i."uuid"															as inquiry_uuid,
                    osp.subject_property_id::text										as oats_subject_property_id,
                    op.property_id::text												as oats_property_id
                from		oats.oats_issues oi
                join		oats.oats_person_organizations opo	on opo.person_organization_id = oi.local_gov_pog_id
                join		oats.oats_organizations	oo			on oo.organization_id = opo.organization_id
                join 		oats.oats_subject_properties osp 	on osp.issue_id = oi.issue_id 
                join 		oats.oats_properties op 			on op.property_id = osp.property_id 
                join		alcs.inquiry i 						on oi.issue_id::varchar = i.file_number 
                where		oo.organization_name = 'VILLAGE OF CHASE'
                and			oi.issu_type = 'INQ'
            END IF;
        END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Too risky
  }
}
