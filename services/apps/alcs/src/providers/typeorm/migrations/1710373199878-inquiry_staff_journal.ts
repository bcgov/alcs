import { MigrationInterface, QueryRunner } from 'typeorm';

export class InquiryStaffJournal1710373199878 implements MigrationInterface {
  name = 'InquiryStaffJournal1710373199878';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."staff_journal" ADD "inquiry_uuid" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4b9a68b9c2f91567e84a604423" ON "alcs"."staff_journal" ("inquiry_uuid") `,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."staff_journal" ADD CONSTRAINT "FK_4b9a68b9c2f91567e84a6044235" FOREIGN KEY ("inquiry_uuid") REFERENCES "alcs"."inquiry"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."staff_journal" DROP CONSTRAINT "FK_4b9a68b9c2f91567e84a6044235"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_4b9a68b9c2f91567e84a604423"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."staff_journal" DROP COLUMN "inquiry_uuid"`,
    );
  }
}
