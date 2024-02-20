import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdvancedParcelMappingTrue1707940567877
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
          BEGIN
              IF EXISTS (SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'oats') THEN
              WITH parcels_to_insert AS (
                  SELECT apps."uuid" as submission_uuid
                  FROM alcs.application_submission apps
                      JOIN oats.oats_subject_properties osp ON osp.alr_application_id = apps.file_number::bigint
                  WHERE osp.alr_application_land_ind <> 'Y' -- ensure that only other parcels are selected
                  ),
                  grouped_parcels AS (
                  SELECT *
                  FROM parcels_to_insert pti
                  Group BY pti.submission_uuid)
              UPDATE 
                  alcs.application_submission
              SET
                  has_other_parcels_in_community = 'True',
                  other_parcels_description = 'Not migrated from OATS'
              FROM 
                  grouped_parcels
              WHERE
                  "uuid" = grouped_parcels.submission_uuid;
            END IF;
      END $$;
    `);
  }

  public async down(): Promise<void> {
    // Do Nothing
  }
}
