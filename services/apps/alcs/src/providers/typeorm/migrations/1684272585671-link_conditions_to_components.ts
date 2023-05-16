import { MigrationInterface, QueryRunner } from 'typeorm';

export class linkConditionsToComponents1684272585671
  implements MigrationInterface
{
  name = 'linkConditionsToComponents1684272585671';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition" DROP CONSTRAINT "FK_d8795b5dbf575cf5996647d9afe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition" ADD "component_uuid" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition" ADD CONSTRAINT "FK_14b7fff6b85bf51b9ab527e64f6" FOREIGN KEY ("type_code") REFERENCES "alcs"."application_decision_condition_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition" ADD CONSTRAINT "FK_9745fcca6616819f804a129fef4" FOREIGN KEY ("component_uuid") REFERENCES "alcs"."application_decision_component"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition" DROP CONSTRAINT "FK_9745fcca6616819f804a129fef4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition" DROP CONSTRAINT "FK_14b7fff6b85bf51b9ab527e64f6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition" DROP COLUMN "component_uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition" ADD CONSTRAINT "FK_d8795b5dbf575cf5996647d9afe" FOREIGN KEY ("type_code") REFERENCES "alcs"."application_decision_condition_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
