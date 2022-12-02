import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixActiveDays1663957166688 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    //Fix query so that it joins properly on calculate_paused_time
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
          LEFT JOIN calculate_paused_time (p_ids) ON calculate_paused_time.application_uuid = application.uuid
          WHERE uuid = ANY(p_ids)
      $$
      LANGUAGE SQL;
    `);
  }

  public async down(): Promise<void> {
    //Why you do this?
  }
}
