import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOatsComponentIdToBoundaryAmendments1708558325989
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_boundary_amendment" ADD "oats_component_id" bigint`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_boundary_amendment"."oats_component_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_alr_appl_components to alcs.application_boundary_amendment.'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_boundary_amendment"."oats_component_id" IS 'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_alr_appl_components to alcs.application_boundary_amendment.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_boundary_amendment" DROP COLUMN "oats_component_id"`,
    );
  }
}
