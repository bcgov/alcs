import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDayCalculations1716848951501 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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
            LEFT JOIN alcs.application ON application.uuid = s1.application_uuid
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
                AND s1.start_date <= COALESCE(application.decision_date, NOW())
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
        CREATE OR REPLACE FUNCTION alcs.calculate_noi_active_days(p_ids uuid[])
          RETURNS TABLE(noi_uuid uuid, active_days integer, paused_days integer)
            LANGUAGE sql
            AS $function$
          SELECT
            "uuid",
            CASE 
              WHEN "date_received_all_items" IS NULL THEN
                NULL
              WHEN "has_open" IS TRUE
                AND "meeting_count" > 0 THEN
                NULL
              WHEN "end_date" IS NOT NULL THEN
                COALESCE("decision_date", NOW())::date - "end_date"::date
              WHEN "decision_date" IS NOT NULL THEN
                "decision_date"::date - "date_received_all_items"::date
              WHEN "meeting_count" = 0 THEN
                NOW()::date - "date_received_all_items"::date
            END AS active_days,
            CASE
              WHEN "date_received_all_items" IS NULL THEN
                NULL
              WHEN "has_open" IS TRUE
                AND "meeting_count" > 0 THEN
                NOW()::date - "start_date"::date
            END AS paused_days
          FROM (
            SELECT
              "notice_of_intent".uuid,
              MAX("decision_date") AS decision_date,
              MAX("date_received_all_items") AS date_received_all_items,
              max("end_date") AS end_date,
              max("start_date") AS start_date,
              bool_or("end_date" IS NULL) AS has_open,
              count("notice_of_intent_meeting"."uuid") AS meeting_count
            FROM
              "alcs"."notice_of_intent"
            LEFT JOIN "alcs"."notice_of_intent_meeting" ON 
              "notice_of_intent"."uuid" = "notice_of_intent_meeting"."notice_of_intent_uuid"
              AND start_date <= COALESCE("decision_date", NOW())
            AND "alcs"."notice_of_intent_meeting"."audit_deleted_date_at" IS NULL
            WHERE "notice_of_intent".uuid = ANY(p_ids)
          GROUP BY
            "notice_of_intent".uuid) meetings
        $function$;
    `);
  }

  public async down(): Promise<void> {
    //Not supported
  }
}
