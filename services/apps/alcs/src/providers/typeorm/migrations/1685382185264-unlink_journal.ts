import { MigrationInterface, QueryRunner } from 'typeorm';

export class unlinkJournal1685382185264 implements MigrationInterface {
  name = 'unlinkJournal1685382185264';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_staff_journal" DROP CONSTRAINT "FK_a074329b9f848c30b4165a79889"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_staff_journal" RENAME TO "staff_journal";`,
    );

    await queryRunner.query(
      `ALTER TABLE "alcs"."staff_journal" RENAME COLUMN "application_uuid" TO "parent_uuid";`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."staff_journal" RENAME TO "application_staff_journal";`,
    );

    await queryRunner.query(
      `ALTER TABLE "alcs"."application_staff_journal" RENAME COLUMN "parent_uuid" TO "application_uuid";`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_staff_journal" ADD CONSTRAINT "FK_a074329b9f848c30b4165a79889" FOREIGN KEY ("application_uuid") REFERENCES "alcs"."application"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
