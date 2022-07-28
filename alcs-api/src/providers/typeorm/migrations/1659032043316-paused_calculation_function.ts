import { MigrationInterface, QueryRunner } from 'typeorm';

export class pausedCalculationFunction1659032043316
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION calculate_paused_time(p_ids uuid[])
      RETURNS TABLE(application_uuid uuid, days int)
      AS $$
      SELECT
          application_uuid,
          (SUM(
              GREATEST( ---Take greater of calculated time or 1 day to round up
                  EXTRACT(
                      epoch FROM (COALESCE(end_date, NOW()) - start_date)  ---coalesce to provide end_date as now if null
                  ),
                  (60 * 60 * 24)::NUMERIC) --- 1 day
              )) / (60 * 60 * 24) AS days --- divide by 1 day in MS to get days
      FROM (
          SELECT
              application_uuid,
              max(end_date) AS end_date, ---Select by max end date, and group by start date, this gets the longest range for each start date
              start_date
          FROM
              application_paused
          WHERE
              application_uuid = ANY(p_ids)
          GROUP BY
              start_date,
              application_uuid) AS paused
      GROUP BY
          application_uuid $$
      LANGUAGE SQL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`delete from public.application_status`);
  }
}
