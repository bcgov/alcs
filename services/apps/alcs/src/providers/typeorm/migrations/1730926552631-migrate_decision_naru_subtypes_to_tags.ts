import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateDecisionNaruSubtypesToTags1730926552631 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      with ranked_components as (
          select  ad.application_uuid,
                  adc.naru_subtype_code,
                  rank() over (partition by ad.application_uuid order by ad.date)
          from    alcs.application_decision ad
          join    alcs.application_decision_component adc on adc.application_decision_uuid = ad."uuid"
          where   ad.is_draft is false
          and     adc.application_decision_component_type_code = 'NARU'
          and     adc.naru_subtype_code is not null
      )
      insert into   alcs.application_tag (application_uuid, tag_uuid)
      select        rc.application_uuid, t."uuid"
      from          ranked_components rc
      join          alcs.tag t    on case
                                    when rc.naru_subtype_code = 'ARFU' then 'Additional Residence'
                                    when rc.naru_subtype_code = 'PRIN' then 'Principal Residence > 500m2'
                                    when rc.naru_subtype_code = 'TOUR' then 'Tourism'
                                  end = t.name
      where         rc.rank = 1
      on conflict do nothing
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
