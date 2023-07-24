import { MigrationInterface, QueryRunner } from 'typeorm';

export class addSharePropertyToSubmission1689980291162
  implements MigrationInterface
{
  name = 'addSharePropertyToSubmission1689980291162';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "excl_share_government_borders" boolean`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "excl_share_government_borders"`,
    );
  }
}
