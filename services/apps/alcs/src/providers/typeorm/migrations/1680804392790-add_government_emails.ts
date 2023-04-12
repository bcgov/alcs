import { MigrationInterface, QueryRunner } from 'typeorm';

export class addGovernmentEmails1680804392790 implements MigrationInterface {
  name = 'addGovernmentEmails1680804392790';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_local_government" ADD "emails" text array NOT NULL DEFAULT '{}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_local_government" DROP COLUMN "emails"`,
    );
  }
}
