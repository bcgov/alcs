import { MigrationInterface, QueryRunner } from 'typeorm';

export class manyToManyComponentConditions1688150315958
  implements MigrationInterface
{
  name = 'manyToManyComponentConditions1688150315958';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition" DROP CONSTRAINT "FK_9745fcca6616819f804a129fef4"`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_decision_condition_component" ("application_decision_condition_uuid" uuid NOT NULL, "application_decision_component_uuid" uuid NOT NULL, CONSTRAINT "PK_5794bea9870c0f65417a3de5e78" PRIMARY KEY ("application_decision_condition_uuid", "application_decision_component_uuid"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9471c8341a43328f1705e5cc2b" ON "alcs"."application_decision_condition_component" ("application_decision_condition_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a26a88960a996c58891c744beb" ON "alcs"."application_decision_condition_component" ("application_decision_component_uuid") `,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition" DROP COLUMN "component_uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component" ADD CONSTRAINT "FK_9471c8341a43328f1705e5cc2bf" FOREIGN KEY ("application_decision_condition_uuid") REFERENCES "alcs"."application_decision_condition"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component" ADD CONSTRAINT "FK_a26a88960a996c58891c744beba" FOREIGN KEY ("application_decision_component_uuid") REFERENCES "alcs"."application_decision_component"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component" DROP CONSTRAINT "FK_a26a88960a996c58891c744beba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component" DROP CONSTRAINT "FK_9471c8341a43328f1705e5cc2bf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition" ADD "component_uuid" uuid`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_a26a88960a996c58891c744beb"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_9471c8341a43328f1705e5cc2b"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."application_decision_condition_component"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition" ADD CONSTRAINT "FK_9745fcca6616819f804a129fef4" FOREIGN KEY ("component_uuid") REFERENCES "alcs"."application_decision_component"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
