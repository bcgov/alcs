import { MigrationInterface, QueryRunner } from 'typeorm';

export class activeDaysCalculationsWithNewFields1662590633503
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    //since we need to bump counting to start after date ack complete, we now need to handle start date being AFTER end date
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION get_weekday_count (start_date TIMESTAMPTZ, end_date TIMESTAMPTZ)
          RETURNS int
          LANGUAGE plpgsql
          AS $$
      DECLARE
          weekday_count integer;
      BEGIN
          SELECT
              CASE WHEN end_date >= start_date THEN
                  SUM(
                      CASE WHEN extract(dow FROM s)
                      IN(0, 6) THEN
                          0
                      ELSE
                          1
                      END) INTO weekday_count
              ELSE
                  0
              END
          FROM
              generate_series(start_date::DATE, end_date::DATE, '1 day'::interval) s;
          RETURN weekday_count;
      END
      $$;
    `);

    //Add logic to only calculate apps active time when date_acknowledged_complete is NOT NULL, else just return 0,0
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION calculate_active_days (p_ids uuid [])
          RETURNS TABLE (
              application_uuid uuid, active_days int, paused_days int)
          AS $$
          SELECT
              uuid,
              CASE WHEN "date_acknowledged_complete" IS NOT NULL THEN
                  active_days_no_holiday - active_holidays - COALESCE(paused_weekdays, 0) + COALESCE(paused_holidays, 0)
              ELSE
                  0
              END AS active_days,
              CASE WHEN "date_acknowledged_complete" IS NOT NULL THEN
                  COALESCE(paused_weekdays, 0) - COALESCE(paused_holidays, 0)
              ELSE
                  0
              END AS paused_days
          FROM
              application
          LEFT JOIN calculate_total_active_days (p_ids) ON calculate_total_active_days.application_uuid = application.uuid
          LEFT JOIN calculate_paused_time (p_ids) ON calculate_total_active_days.application_uuid = application.uuid
          WHERE uuid = ANY(p_ids)
      $$
      LANGUAGE SQL;
    `);

    // Change calculation to use date_ack_complete + 1 as start date, and either decision_date or NOW as end date
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION calculate_total_active_days (p_ids uuid [])
          RETURNS TABLE (
              application_uuid uuid, active_days_no_holiday int, active_holidays int)
          AS $$
          SELECT
              uuid,
              get_weekday_count (date_acknowledged_complete::TIMESTAMPTZ + interval '1' day,
                  COALESCE(decision_date, override.now()::TIMESTAMPTZ)) AS active_days_no_holiday,
              get_holiday_count (date_acknowledged_complete::TIMESTAMPTZ + interval '1' day,
                  COALESCE(decision_date, override.now()::TIMESTAMPTZ)) AS active_holidays
          FROM
              application
          WHERE
              uuid = ANY (p_ids);
      $$
      LANGUAGE SQL;
    `);
  }

  public async down(): Promise<void> {
    //NOT SUPPORTED
  }
}
