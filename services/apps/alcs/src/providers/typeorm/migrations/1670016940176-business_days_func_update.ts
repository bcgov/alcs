import { MigrationInterface, QueryRunner } from 'typeorm';

export class businessDaysFuncUpdate1670016940176 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION alcs.calculate_business_days (start_date TIMESTAMPTZ, end_date TIMESTAMPTZ)
        RETURNS TABLE (
          business_days int)
        AS $$
        SELECT
          CASE WHEN start_date is null OR end_date is null THEN NULL
          ELSE
          alcs.get_weekday_count (start_date,
            end_date) - alcs.get_holiday_count (start_date,
            end_date)
          END AS business_days
      $$
      LANGUAGE SQL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // not needed
  }
}
