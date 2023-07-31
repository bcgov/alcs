import { MigrationInterface, QueryRunner } from 'typeorm';

export class planNumbersOnConditionComponentTable1690842571824
  implements MigrationInterface
{
  name = 'planNumbersOnConditionComponentTable1690842571824';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component" DROP CONSTRAINT "FK_9471c8341a43328f1705e5cc2bf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component" DROP CONSTRAINT "FK_a26a88960a996c58891c744beba"`,
    );
    await queryRunner.query(
      `TRUNCATE TABLE "alcs"."application_decision_condition_component" `,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_9471c8341a43328f1705e5cc2b"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_a26a88960a996c58891c744beb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component" ADD "plan_numbers" text`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9471c8341a43328f1705e5cc2b" ON "alcs"."application_decision_condition_component" ("application_decision_condition_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a26a88960a996c58891c744beb" ON "alcs"."application_decision_condition_component" ("application_decision_component_uuid") `,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component" ADD CONSTRAINT "FK_9471c8341a43328f1705e5cc2bf" FOREIGN KEY ("application_decision_condition_uuid") REFERENCES "alcs"."application_decision_condition"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component" ADD CONSTRAINT "FK_a26a88960a996c58891c744beba" FOREIGN KEY ("application_decision_component_uuid") REFERENCES "alcs"."application_decision_component"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
      `DROP INDEX "alcs"."IDX_a26a88960a996c58891c744beb"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_9471c8341a43328f1705e5cc2b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component" DROP COLUMN "plan_numbers"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a26a88960a996c58891c744beb" ON "alcs"."application_decision_condition_component" ("application_decision_component_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9471c8341a43328f1705e5cc2b" ON "alcs"."application_decision_condition_component" ("application_decision_condition_uuid") `,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component" ADD CONSTRAINT "FK_a26a88960a996c58891c744beba" FOREIGN KEY ("application_decision_component_uuid") REFERENCES "alcs"."application_decision_component"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component" ADD CONSTRAINT "FK_9471c8341a43328f1705e5cc2bf" FOREIGN KEY ("application_decision_condition_uuid") REFERENCES "alcs"."application_decision_condition"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
