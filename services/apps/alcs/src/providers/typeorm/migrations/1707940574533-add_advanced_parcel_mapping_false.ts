import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdvancedParcelMappingFalse1707940574533
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        WITH parcels_that_are_false AS (
            SELECT *
            FROM alcs.application_submission as2
            WHERE as2.audit_created_by = 'oats_etl' AND as2.audit_updated_by IS NULL AND as2.has_other_parcels_in_community IS NOT TRUE
        )
        UPDATE 
            alcs.application_submission 
        SET 
            has_other_parcels_in_community = FALSE
        FROM 
            parcels_that_are_false
        WHERE 
            alcs.application_submission."uuid" = parcels_that_are_false."uuid"

        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Do Nothing
  }
}
