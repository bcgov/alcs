import { MigrationInterface, QueryRunner } from 'typeorm';

export class updatePausedCalc1664212453890 implements MigrationInterface {
  name = 'updatePausedCalc1664212453890';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
          SELECT -- https://stackoverflow.com/questions/2561130/merge-overlapping-date-intervals
            s1.application_uuid,
            s1.start_date,
            LEAST(MIN(t1.end_date), NOW()) AS end_date -- Use min to not count pause time in the future
          FROM
            application_paused s1
            INNER JOIN application_paused t1 ON s1.start_date <= COALESCE(t1.end_date, NOW())
              AND s1.application_uuid = t1.application_uuid
              AND NOT EXISTS (
                SELECT
                  *
                FROM
                  application_paused t2
              WHERE
                COALESCE(t1.end_date, NOW()) >= t2.start_date
                AND COALESCE(t1.end_date, NOW()) < COALESCE(t2.end_date, NOW()) --- use coalesce since end_date may be null
                AND t1.application_uuid = t2.application_uuid)
            WHERE
              NOT EXISTS (
                SELECT
                  *
                FROM
                  application_paused s2
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
    $$
    LANGUAGE SQL;`);
  }

  public async down(): Promise<void> {
    //Not needed
  }
}
