import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixSearchFunctionStatusWeights1697048162692
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE OR REPLACE FUNCTION alcs.get_current_status_for_application_submission_by_uuid(application_submission_uuid uuid)
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
                      astss.submission_uuid , astss.status_type_code ,astss.effective_date, asst."label"
                      FROM alcs.application_submission_status_type asst 
                      JOIN alcs.application_submission_to_submission_status astss
                              ON asst.code = astss.status_type_code
                              AND astss.submission_uuid = application_submission_uuid
                              AND astss.effective_date IS NOT NULL
                      WHERE
                              astss.effective_date < utc_timestamp_tomorrow
                      ORDER BY weight desc, astss.effective_date desc
                      LIMIT 1 INTO result;
                      
                  RETURN row_to_json(RESULT);
      
        END;$function$
     ;`);

    await queryRunner.query(`CREATE OR REPLACE FUNCTION alcs.get_current_status_for_notice_of_intent_submission_by_uuid(application_submission_uuid uuid)
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
            noistss.submission_uuid , noistss.status_type_code ,noistss.effective_date, noisst."label"
            FROM alcs.notice_of_intent_submission_status_type noisst 
            JOIN alcs.notice_of_intent_submission_to_submission_status noistss
                    ON noisst.code = noistss.status_type_code
                    AND noistss.submission_uuid = application_submission_uuid
                    AND noistss.effective_date IS NOT NULL
            WHERE
                    noistss.effective_date < utc_timestamp_tomorrow
            ORDER BY weight desc, noistss.effective_date desc
            LIMIT 1 INTO result;
            
        RETURN row_to_json(RESULT);
        END;
      $function$
      ;`);

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
          weight DESC,
          notistss.effective_date DESC
        LIMIT 1 INTO result;
        RETURN row_to_json(RESULT);
      END;
      $function$;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
