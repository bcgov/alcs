import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPrStaffJournal1709771987741 implements MigrationInterface {
  name = 'AddPrStaffJournal1709771987741';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."staff_journal" ADD "planning_review_uuid" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dd6d16cefeda057f9f7d1f909b" ON "alcs"."staff_journal" ("planning_review_uuid") `,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."staff_journal" ADD CONSTRAINT "FK_dd6d16cefeda057f9f7d1f909bc" FOREIGN KEY ("planning_review_uuid") REFERENCES "alcs"."planning_review"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."staff_journal" DROP CONSTRAINT "FK_dd6d16cefeda057f9f7d1f909bc"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_dd6d16cefeda057f9f7d1f909b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."staff_journal" DROP COLUMN "planning_review_uuid"`,
    );
  }
}
