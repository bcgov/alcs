import { MigrationInterface, QueryRunner } from 'typeorm';

export class addStatusFunctionForNotification1695230223368
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE OR REPLACE FUNCTION alcs.get_current_status_for_notification_submission_by_uuid (application_submission_uuid uuid)
        RETURNS jsonb
        LANGUAGE plpgsql
        AS $function$
      DECLARE
        utc_timestamp_tomorrow timestamptz;
        result RECORD;
      BEGIN
        -- TODO adjust the date according to api
        utc_timestamp_tomorrow = timezone('utc', (now() - INTERVAL '-1 DAY'));
        SELECT
          notistss.submission_uuid,
          notistss.status_type_code,
          notistss.effective_date,
          noti_status. "label"
        FROM
          alcs.notification_submission_status_type noti_status
          JOIN alcs.notification_submission_to_submission_status notistss ON noti_status.code = notistss.status_type_code
            AND notistss.submission_uuid = application_submission_uuid
            AND notistss.effective_date IS NOT NULL
        WHERE
          notistss.effective_date < utc_timestamp_tomorrow
        ORDER BY
          notistss.effective_date DESC,
          weight DESC
        LIMIT 1 INTO result;
        RETURN row_to_json(RESULT);
      END;
      $function$;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //nope
  }
}
