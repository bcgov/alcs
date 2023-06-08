import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNoiTimeTrackingFunctions1686247431010
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
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
            LEFT JOIN "alcs"."notice_of_intent_meeting" ON "notice_of_intent"."uuid" = "notice_of_intent_meeting"."notice_of_intent_uuid"
            AND "alcs"."notice_of_intent_meeting"."audit_deleted_date_at" IS NULL
            WHERE "notice_of_intent".uuid = ANY(p_ids)
          GROUP BY
            "notice_of_intent".uuid) meetings
        $function$;
    `);
  }

  public async down(): Promise<void> {
    //No
  }
}
