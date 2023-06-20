import { MigrationInterface, QueryRunner } from 'typeorm';

export class pofoDecisionComponentFields1686870243798
  implements MigrationInterface
{
  name = 'pofoDecisionComponentFields1686870243798';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ADD "soil_fill_type_to_place" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ADD "soil_to_place_volume" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ADD "soil_to_place_area" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ADD "soil_to_place_maximum_depth" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ADD "soil_to_place_average_depth" numeric(12,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" DROP COLUMN "soil_fill_type_to_place"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" DROP COLUMN "soil_to_place_average_depth"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" DROP COLUMN "soil_to_place_maximum_depth"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" DROP COLUMN "soil_to_place_area"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" DROP COLUMN "soil_to_place_volume"`,
    );
  }
}
