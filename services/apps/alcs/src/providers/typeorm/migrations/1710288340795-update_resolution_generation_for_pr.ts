import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateResolutionGenerationForPr1710288340795
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION alcs.generate_next_resolution_number(p_resolution_year integer)
              RETURNS integer
              LANGUAGE plpgsql
          AS $function$
              declare next_resolution_number integer;
          BEGIN\t
              select
                row_num into next_resolution_number
              from
                (
                select
                  coalesce(resolution_number, 0) as resolution_number,
                  row_number() over (
                  order by resolution_number) row_num
                from
                  (
                    select resolution_number, audit_deleted_date_at
                    from alcs.application_decision
                    where resolution_year = p_resolution_year
                    UNION
                    select resolution_number, audit_deleted_date_at
                    from alcs.notice_of_intent_decision
                    where resolution_year = p_resolution_year
                    UNION
                    select resolution_number, audit_deleted_date_at
                    from alcs.planning_review_decision
                    where resolution_year = p_resolution_year
                  ) as combined
                where
                  audit_deleted_date_at is null
                ) z
              where
                row_num != resolution_number
              order by
                row_num offset 0 row fetch next 1 row only;
          
              return coalesce(next_resolution_number, 1);
          END;
          $function$;
        `);
  }

  public async down(): Promise<void> {
    //No
  }
}
