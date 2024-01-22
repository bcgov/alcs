import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNotificationStaffJournal1694456197990
  implements MigrationInterface
{
  name = 'addNotificationStaffJournal1694456197990';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."staff_journal" ADD "notification_uuid" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_48498a0c9b847d726d2b582f50" ON "alcs"."staff_journal" ("notification_uuid") `,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."staff_journal" ADD CONSTRAINT "FK_48498a0c9b847d726d2b582f50a" FOREIGN KEY ("notification_uuid") REFERENCES "alcs"."notification"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."staff_journal" DROP CONSTRAINT "FK_48498a0c9b847d726d2b582f50a"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_48498a0c9b847d726d2b582f50"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."staff_journal" DROP COLUMN "notification_uuid"`,
    );
  }
}
