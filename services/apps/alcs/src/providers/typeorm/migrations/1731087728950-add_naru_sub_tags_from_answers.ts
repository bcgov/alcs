import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNaruSubTagsFromAnswers1731087728950 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      insert into
        alcs.application_tag (application_uuid, tag_uuid)
      select
        distinct a."uuid",
        t."uuid"
      from
        alcs.application_submission as2
        join alcs.application a on a.file_number = as2.file_number
        left join alcs.application_decision ad on ad.application_uuid = a."uuid"
        join alcs.tag t on (
          (
            as2.naru_will_be_over_five_hundred_m2
            and t."name" = 'Principal Residence > 500m2'
          )
          or (
            as2.naru_will_have_temporary_foreign_worker_housing
            and t."name" = 'Temporary Foreign Worker Housing'
          )
          or (
            as2.naru_will_retain_residence
            and t."name" = 'Reside & Replace'
          )
          or (
            as2.naru_will_have_additional_residence
            and t."name" = 'Additional Residence'
          )
          or (
            as2.naru_will_import_fill
            and t."name" = 'Fill Placement'
          )
        )
      where
        t.audit_deleted_date_at is null
      group by
        a."uuid",
        t."uuid"
      having
        count(
          case
            when ad.outcome_code = 'APPR' then 1
          end
        ) = 0 on conflict do nothing;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
