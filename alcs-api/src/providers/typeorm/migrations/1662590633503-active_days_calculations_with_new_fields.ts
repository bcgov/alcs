import { MigrationInterface, QueryRunner } from 'typeorm';

export class activeDaysCalculationsWithNewFields1662590633503
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION calculate_total_active_days (p_ids uuid [])
          RETURNS TABLE (
              application_uuid uuid, active_days_no_holiday int, active_holidays int)
          AS $$
      SELECT
          uuid,
          get_weekday_count (date_received,
              COALESCE(decision_date, override.now()::TIMESTAMPTZ)) AS active_days_no_holiday,
          get_holiday_count (date_received,
              COALESCE(decision_date, override.now()::TIMESTAMPTZ)) AS active_holidays
      FROM
          application
      WHERE uuid = ANY(p_ids);
      $$
      LANGUAGE SQL;
    `);
  }

  public async down(): Promise<void> {
    //NOT SUPPORTED
  }
}
