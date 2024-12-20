import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBondConditionsWhereMissing1734644882049 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Applications
    queryRunner.query(`
      do $$
      begin
        if exists (select schema_name from information_schema.schemata where schema_name = 'oats') then
          insert into
            alcs.application_decision_condition (
              audit_created_by,
              decision_uuid,
              security_amount,
              type_code
            )
          select
            distinct 'oats_etl' as audit_created_by,
            ad."uuid" as decision_uuid,
            oaad.security_amt as security_amount,
            'BOND' as type_code
          from
            alcs.application_decision ad
            join alcs.application_decision_condition adc on ad.uuid = adc.decision_uuid
            right join oats.oats_alr_appl_decisions oaad on oaad.alr_appl_decision_id = ad.oats_alr_appl_decision_id
          where
            ad."uuid" not in (
              select
                adc.decision_uuid
              from
                alcs.application_decision_condition adc
              where
                adc.type_code = 'BOND'
            )
            and adc.security_amount > 0
            and ad.audit_created_by = 'oats_etl'
            and (
              oaad.security_amt = adc.security_amount
              or adc.security_amount is null
            ) on conflict ("uuid") do nothing;
        end if;
      end $$;
    `);

    // NOI's
    queryRunner.query(`
      do $$
      begin
        if exists (select schema_name from information_schema.schemata where schema_name = 'oats') then
          insert into
            alcs.notice_of_intent_decision_condition (
              audit_created_by,
              decision_uuid,
              security_amount,
              type_code
            )
          select
            distinct 'oats_etl' as audit_created_by,
            noid."uuid" as decision_uuid,
            oaad.security_amt as security_amount,
            'BOND' as type_code
          from
            alcs.notice_of_intent_decision noid
            join alcs.notice_of_intent_decision_condition noidc on noid.uuid = noidc.decision_uuid
            right join oats.oats_alr_appl_decisions oaad on oaad.alr_appl_decision_id = noid.oats_alr_appl_decision_id
          where
            noid."uuid" not in (
              select
                noidc.decision_uuid
              from
                alcs.notice_of_intent_decision_condition noidc
              where
                noidc.type_code = 'BOND'
            )
            and noidc.security_amount > 0
            and noid.audit_created_by = 'oats_etl'
            and (
              oaad.security_amt = noidc.security_amount
              or noidc.security_amount is null
            ) on conflict ("uuid") do nothing;
        end if;
      end $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
