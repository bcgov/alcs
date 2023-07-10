import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameApplicationStatus1688754925920
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_status" RENAME TO "submission_status_type";`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // nope
  }
}
