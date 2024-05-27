import { MigrationInterface, QueryRunner } from 'typeorm';

export class MapLegacyIdToInquiries1716834660249 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DO $$
        BEGIN
            IF EXISTS (SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'oats') THEN
                WITH alcs_legacy_id_to_update AS (
                SELECT
                    ai.file_number
                FROM
                    alcs.inquiry ai
                WHERE
                    audit_created_by = 'oats_etl'
                    AND legacy_id IS NULL
                ),
                issue_and_legacy_issue AS (
                SELECT
                    issue_id, 
                    legacy_issue_nbr
                FROM
                    oats.oats_issues oi
                JOIN alcs_legacy_id_to_update AS alcs_leg ON
                    alcs_leg.file_number::bigint = oi.issue_id
                WHERE
                    legacy_issue_nbr IS NOT NULL
                )
                UPDATE alcs.inquiry 
                SET legacy_id = COALESCE(issue_and_legacy_issue.legacy_issue_nbr, alcs.inquiry.legacy_id)
                FROM issue_and_legacy_issue
                WHERE alcs.inquiry.file_number = issue_and_legacy_issue.issue_id::TEXT;
            END IF;
        END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //NONE
  }
}
