import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeRedundantJsonbLotColumn1691000806656
  implements MigrationInterface
{
  name = 'removeRedundantJsonbLotColumn1691000806656';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component" DROP CONSTRAINT "FK_9471c8341a43328f1705e5cc2bf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component" DROP CONSTRAINT "FK_a26a88960a996c58891c744beba"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_9471c8341a43328f1705e5cc2b"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_a26a88960a996c58891c744beb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" DROP COLUMN "subd_approved_lots"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_condition_component" DROP COLUMN "plan_numbers"`,
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
      `ALTER TABLE "alcs"."application_decision_condition_component" ADD CONSTRAINT "FK_9471c8341a43328f1705e5cc2bf" FOREIGN KEY ("application_decision_condition_uuid") REFERENCES "alcs"."application_decision_condition"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
      `ALTER TABLE "alcs"."application_decision_condition_component" ADD "plan_numbers" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ADD "subd_approved_lots" jsonb NOT NULL DEFAULT '[]'`,
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
