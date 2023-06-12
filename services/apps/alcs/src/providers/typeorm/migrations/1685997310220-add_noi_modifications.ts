import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNoiModifications1685997310220 implements MigrationInterface {
  name = 'addNoiModifications1685997310220';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."notice_of_intent_modified_decisions" ("notice_of_intent_modification_uuid" uuid NOT NULL, "notice_of_intent_decision_uuid" uuid NOT NULL, CONSTRAINT "PK_798d2aa6d409681499e50b47725" PRIMARY KEY ("notice_of_intent_modification_uuid", "notice_of_intent_decision_uuid"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_894724a7cd92f5c0d5dd08e899" ON "alcs"."notice_of_intent_modified_decisions" ("notice_of_intent_modification_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_31b5c6e87e4e94df69f38770ed" ON "alcs"."notice_of_intent_modified_decisions" ("notice_of_intent_decision_uuid") `,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_modified_decisions" ADD CONSTRAINT "FK_894724a7cd92f5c0d5dd08e8998" FOREIGN KEY ("notice_of_intent_modification_uuid") REFERENCES "alcs"."notice_of_intent_modification"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_modified_decisions" ADD CONSTRAINT "FK_31b5c6e87e4e94df69f38770ed1" FOREIGN KEY ("notice_of_intent_decision_uuid") REFERENCES "alcs"."notice_of_intent_decision"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_modified_decisions" DROP CONSTRAINT "FK_31b5c6e87e4e94df69f38770ed1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_modified_decisions" DROP CONSTRAINT "FK_894724a7cd92f5c0d5dd08e8998"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_31b5c6e87e4e94df69f38770ed"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_894724a7cd92f5c0d5dd08e899"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."notice_of_intent_modified_decisions"`,
    );
  }
}
