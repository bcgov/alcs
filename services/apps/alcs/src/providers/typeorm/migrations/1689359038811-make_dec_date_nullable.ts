import { MigrationInterface, QueryRunner } from 'typeorm';

export class makeDecDateNullable1689359038811 implements MigrationInterface {
  name = 'makeDecDateNullable1689359038811';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ALTER COLUMN "date" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ALTER COLUMN "date" SET NOT NULL`,
    );
  }
}
