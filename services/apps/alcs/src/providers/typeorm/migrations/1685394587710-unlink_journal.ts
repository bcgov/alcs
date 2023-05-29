import { MigrationInterface, QueryRunner } from 'typeorm';

export class unlinkJournal1685394587710 implements MigrationInterface {
  name = 'unlinkJournal1685394587710';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_staff_journal" RENAME TO "staff_journal";`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."staff_journal" DROP CONSTRAINT "FK_4fd7ecf06dd0615a01f5e75b0f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."staff_journal" DROP CONSTRAINT "FK_a074329b9f848c30b4165a79889"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_a074329b9f848c30b4165a7988"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."staff_journal" ADD "notice_of_intent_uuid" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."staff_journal" ALTER COLUMN "application_uuid" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_307f19048298cf30add9562a0b" ON "alcs"."staff_journal" ("application_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_130f95c5d9a8a1d7b9149d62b3" ON "alcs"."staff_journal" ("notice_of_intent_uuid") `,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."staff_journal" ADD CONSTRAINT "FK_e21493108139ef325ef10bcf7c1" FOREIGN KEY ("author_uuid") REFERENCES "alcs"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."staff_journal" ADD CONSTRAINT "FK_307f19048298cf30add9562a0b7" FOREIGN KEY ("application_uuid") REFERENCES "alcs"."application"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."staff_journal" ADD CONSTRAINT "FK_130f95c5d9a8a1d7b9149d62b39" FOREIGN KEY ("notice_of_intent_uuid") REFERENCES "alcs"."notice_of_intent"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."staff_journal" DROP CONSTRAINT "FK_130f95c5d9a8a1d7b9149d62b39"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."staff_journal" DROP CONSTRAINT "FK_307f19048298cf30add9562a0b7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."staff_journal" DROP CONSTRAINT "FK_e21493108139ef325ef10bcf7c1"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_130f95c5d9a8a1d7b9149d62b3"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_307f19048298cf30add9562a0b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."staff_journal" ALTER COLUMN "application_uuid" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."staff_journal" DROP COLUMN "notice_of_intent_uuid"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a074329b9f848c30b4165a7988" ON "alcs"."staff_journal" ("application_uuid") `,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."staff_journal" ADD CONSTRAINT "FK_a074329b9f848c30b4165a79889" FOREIGN KEY ("application_uuid") REFERENCES "alcs"."application"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."staff_journal" ADD CONSTRAINT "FK_4fd7ecf06dd0615a01f5e75b0f4" FOREIGN KEY ("author_uuid") REFERENCES "alcs"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."staff_journal" RENAME TO "application_staff_journal";`,
    );
  }
}
