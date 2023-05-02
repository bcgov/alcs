import { MigrationInterface, QueryRunner } from 'typeorm';

export class generateNextResolutionNumber1683048988258
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE OR REPLACE FUNCTION alcs.generate_next_resolution_number(p_resolution_year integer)
          RETURNS integer
          LANGUAGE plpgsql
        AS $function$
          
            declare next_resolution_number integer;
          BEGIN	
            select
              row_num into next_resolution_number
            from
              (
              select
                coalesce(resolution_number, 0) as resolution_number,
                row_number() over (
                order by resolution_number) row_num
              from
                alcs.application_decision
              where
                resolution_year = p_resolution_year
                and audit_deleted_date_at is null
              ) z
            where
              row_num != resolution_number
            order by
              row_num offset 0 row fetch next 1 row only;
        
            return coalesce(next_resolution_number, 1);
          END;
        $function$
        ;     
       `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //nope
  }
}
