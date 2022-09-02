import { MigrationInterface, QueryRunner } from 'typeorm';

export class activeDaysCalculationsConvertToTimestamptz1662153913029
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION get_weekday_count (start_date TIMESTAMPTZ, end_date TIMESTAMPTZ)
          RETURNS int
          LANGUAGE plpgsql
          AS $$
      DECLARE
          weekday_count integer;
      BEGIN
          SELECT
              SUM(
                  CASE WHEN extract(dow FROM s)
                  IN(0, 6) THEN
                      0
                  ELSE
                      1
                  END) INTO weekday_count
          FROM
              generate_series(start_date, end_date, '1 day'::interval) s;
          RETURN weekday_count;
      END;
      $$;
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION get_holiday_count (start_date TIMESTAMPTZ, end_date TIMESTAMPTZ)
          RETURNS int
          LANGUAGE plpgsql
          AS $$
      DECLARE
          holiday_count integer;
      BEGIN
          SELECT
              COUNT(UUID) INTO holiday_count
          FROM
              holiday_entity
          WHERE
              holiday_entity. "day" BETWEEN start_date
              AND end_date;
          RETURN holiday_count;
      END;
      $$;
    `);

    await queryRunner.query(`DROP function IF EXISTS calculate_paused_time;`);
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION calculate_paused_time (p_ids uuid [])
          RETURNS TABLE (
              application_uuid uuid, paused_weekdays int, paused_holidays int)
          AS $$
      SELECT
          application_uuid,
          SUM(pause_weekdays)::INT AS paused_weekdays,
          SUM(pause_holidays)::INT AS paused_holidays
      FROM ( --Load each pause for application with each having its own count of weekdays and holidays
          SELECT
              application_uuid,
              start_date,
              end_date,
              get_weekday_count (start_date::TIMESTAMPTZ,
                  COALESCE(end_date, override.now()::TIMESTAMPTZ)) AS pause_weekdays,
              get_holiday_count (start_date::DATE,
                  COALESCE(end_date, override.now()::TIMESTAMPTZ)) AS pause_holidays
          FROM (
              SELECT
                  application_uuid,
                  max(end_date) AS end_date, ---Select by max end date, and group by start date, this gets the longest range for each start date
                  start_date
              FROM
                  application_paused
              GROUP BY
                  start_date,
                  application_uuid) pauses) pauses2
          WHERE application_uuid = ANY(p_ids)
      GROUP BY
          application_uuid;
      $$
      LANGUAGE SQL;
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION calculate_total_active_days (p_ids uuid [])
          RETURNS TABLE (
              application_uuid uuid, active_days_no_holiday int, active_holidays int)
          AS $$
      SELECT
          uuid,
          get_weekday_count (created_at::TIMESTAMPTZ,
              override.now()::TIMESTAMPTZ) AS active_days_no_holiday,
          get_holiday_count (created_at::TIMESTAMPTZ,
              override.now()::TIMESTAMPTZ) AS active_holidays
      FROM
          application
      WHERE uuid = ANY(p_ids);
      $$
      LANGUAGE SQL;
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION calculate_active_days (p_ids uuid [])
          RETURNS TABLE (
              application_uuid uuid, active_days int, paused_days int)
          AS $$
          SELECT
              calculate_total_active_days.application_uuid,
              active_days_no_holiday - active_holidays - COALESCE(paused_weekdays, 0) + COALESCE(paused_holidays, 0) AS active_days,
              COALESCE(paused_weekdays, 0) - COALESCE(paused_holidays, 0) AS paused_days
          FROM
              calculate_total_active_days (p_ids)
              LEFT JOIN calculate_paused_time (p_ids) 
              ON calculate_total_active_days.application_uuid = calculate_paused_time.application_uuid;
      $$
      LANGUAGE SQL;
    `);
  }

  public async down(): Promise<void> {
    //NOT SUPPORTED
  }
}
