import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameReconsiderationType1665601824422
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reconsideration_type" RENAME TO "application_reconsideration_type";`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
