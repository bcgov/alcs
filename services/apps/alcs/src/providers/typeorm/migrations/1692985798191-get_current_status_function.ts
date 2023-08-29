import { MigrationInterface, QueryRunner } from 'typeorm';

export class getCurrentStatusFunction1692985798191
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE OR REPLACE FUNCTION alcs.get_current_status_for_submission_by_uuid(application_submission_uuid uuid)
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
                      ORDER BY astss.effective_date desc, weight desc
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
