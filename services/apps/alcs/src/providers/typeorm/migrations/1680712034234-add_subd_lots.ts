import { MigrationInterface, QueryRunner } from 'typeorm';

export class addSubdLots1680712034234 implements MigrationInterface {
  name = 'addSubdLots1680712034234';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "subd_proposed_lots" jsonb NOT NULL DEFAULT '[]'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "subd_proposed_lots"`,
    );
  }
}
