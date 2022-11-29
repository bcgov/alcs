import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateApplication1669762444564 implements MigrationInterface {
  name = 'updateApplication1669762444564';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ALTER COLUMN "applicant" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ALTER COLUMN "applicant" SET NOT NULL`,
    );
  }
}
