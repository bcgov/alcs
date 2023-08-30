import { MigrationInterface, QueryRunner } from 'typeorm';

export class getCurrentStatusForNoiFunction1693410408169
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE OR REPLACE FUNCTION alcs.get_current_status_for_notice_of_intent_submission_by_uuid(application_submission_uuid uuid)
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
                        ORDER BY noistss.effective_date desc, weight desc
                        LIMIT 1 INTO result;
                        
                    RETURN row_to_json(RESULT);
        
                END;$function$
           ;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // nope
  }
}
