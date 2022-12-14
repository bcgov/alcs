import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedFunctions1570977217124 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION alcs.get_holiday_count(start_date timestamp with time zone, end_date timestamp with time zone)
      RETURNS integer
      LANGUAGE plpgsql
      AS $function$
          DECLARE
              holiday_count integer;
          BEGIN
              SELECT
                  COUNT(UUID) INTO holiday_count
              FROM
                  alcs.holiday_entity
              WHERE
                  holiday_entity. "day" BETWEEN start_date::DATE
                  AND end_date::DATE;
              RETURN holiday_count;
          END;
          $function$
      ;
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION alcs.get_weekday_count (start_date TIMESTAMPTZ, end_date TIMESTAMPTZ)
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

    await queryRunner.query(`    
    CREATE OR REPLACE FUNCTION alcs.calculate_total_active_days(p_ids uuid[])
    RETURNS TABLE(application_uuid uuid, active_days_no_holiday integer, active_holidays integer)
    LANGUAGE sql
    AS $function$
                SELECT
                    uuid,
                    alcs.get_weekday_count (date_acknowledged_complete::TIMESTAMPTZ + interval '1' day,
                        COALESCE(decision_date, override.now()::TIMESTAMPTZ)) AS active_days_no_holiday,
                    alcs.get_holiday_count (date_acknowledged_complete::TIMESTAMPTZ + interval '1' day,
                        COALESCE(decision_date, override.now()::TIMESTAMPTZ)) AS active_holidays
                FROM
                    alcs.application
                WHERE
                    uuid = ANY (p_ids);
            $function$
    ;`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION alcs.calculate_paused_time(p_ids uuid[])
    RETURNS TABLE(application_uuid uuid, paused_weekdays integer, paused_holidays integer)
    LANGUAGE sql
    AS $function$
        SELECT
        application_uuid,
        SUM(pause_weekdays)::INT AS paused_weekdays,
        SUM(pause_holidays)::INT AS paused_holidays
        FROM ( --Load each pause for application with each having its own count of weekdays and holidays
        SELECT
            application_uuid,
            start_date,
            end_date,
            alcs.get_weekday_count (start_date::TIMESTAMPTZ,
            COALESCE(end_date, override.now()::TIMESTAMPTZ)) AS pause_weekdays,
        alcs.get_holiday_count (start_date::DATE,
            COALESCE(end_date, override.now()::TIMESTAMPTZ)) AS pause_holidays
        FROM (
            SELECT -- https://stackoverflow.com/questions/2561130/merge-overlapping-date-intervals
            s1.application_uuid,
            s1.start_date,
            LEAST(MIN(t1.end_date), NOW()) AS end_date -- Use min to not count pause time in the future
            FROM
            alcs.application_paused s1
            INNER JOIN alcs.application_paused t1 ON s1.start_date <= COALESCE(t1.end_date, NOW())
                AND s1.application_uuid = t1.application_uuid
                AND NOT EXISTS (
                SELECT
                    *
                FROM
                alcs.application_paused t2
                WHERE
                COALESCE(t1.end_date, NOW()) >= t2.start_date
                AND COALESCE(t1.end_date, NOW()) < COALESCE(t2.end_date, NOW()) --- use coalesce since end_date may be null
                AND t1.application_uuid = t2.application_uuid)
            WHERE
                NOT EXISTS (
                SELECT
                    *
                FROM
                alcs.application_paused s2
                WHERE
                    s1.start_date > s2.start_date
                    AND s1.start_date <= COALESCE(s2.end_date, NOW())
                    AND s1.application_uuid = s2.application_uuid)
                AND s1.application_uuid = ANY (p_ids)
                AND s1.start_date <= NOW()
                GROUP BY
                s1.application_uuid, s1.start_date) pauses) pauses2
    WHERE
        application_uuid = ANY (p_ids)
    GROUP BY
        application_uuid;
    $function$
    ;
    `);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION alcs.calculate_active_days(p_ids uuid[])
    RETURNS TABLE(application_uuid uuid, active_days integer, paused_days integer)
    LANGUAGE sql
    AS $function$
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
                alcs.application
            LEFT JOIN alcs.calculate_total_active_days (p_ids) ON calculate_total_active_days.application_uuid = application.uuid
            LEFT JOIN alcs.calculate_paused_time (p_ids) ON calculate_paused_time.application_uuid = application.uuid
            WHERE uuid = ANY(p_ids)
        $function$
    ;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //Not supported
  }
}
