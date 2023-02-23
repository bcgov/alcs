import { MigrationInterface, QueryRunner } from 'typeorm';

export class addLgActive1677104946106 implements MigrationInterface {
  name = 'addLgActive1677104946106';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_local_government" ADD "is_active" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_local_government" DROP COLUMN "is_active"`,
    );
  }
}
