import { MigrationInterface, QueryRunner } from 'typeorm';

export class rosoDecisionComponentFields1686935517226
  implements MigrationInterface
{
  name = 'rosoDecisionComponentFields1686935517226';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ADD "soil_type_removed" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ADD "soil_to_remove_volume" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ADD "soil_to_remove_area" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ADD "soil_to_remove_maximum_depth" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ADD "soil_to_remove_average_depth" numeric(12,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" DROP COLUMN "soil_to_remove_average_depth"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" DROP COLUMN "soil_to_remove_maximum_depth"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" DROP COLUMN "soil_to_remove_area"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" DROP COLUMN "soil_to_remove_volume"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" DROP COLUMN "soil_type_removed"`,
    );
  }
}
