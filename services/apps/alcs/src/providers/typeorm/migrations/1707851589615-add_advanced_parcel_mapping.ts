import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdvancedParcelMapping1707851589615
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    UPDATE
        alcs.application_submission
    SET
        has_other_parcels_in_community = 'False';
    WITH parcel_count as (
        SELECT count(*), ap.application_submission_uuid
        FROM alcs.application_parcel ap 
        GROUP BY ap.application_submission_uuid 
        HAVING count (application_submission_uuid) > 1
        )
    UPDATE 
        alcs.application_submission
    SET
        has_other_parcels_in_community = 'True',
        other_parcels_description = 'Not migrated from OATS'
    FROM 
        parcel_count
    WHERE
        "uuid" = parcel_count.application_submission_uuid
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //Nothing
  }
}
