import { MigrationInterface, QueryRunner } from 'typeorm';

export class addAppTypeGovernmentReviewRequired1698255209608
  implements MigrationInterface
{
  name = 'addAppTypeGovernmentReviewRequired1698255209608';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_type" ADD "requires_government_review" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(`
      UPDATE "alcs"."application_type" SET "requires_government_review" = false WHERE "code" = 'TURP';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_type" DROP COLUMN "requires_government_review"`,
    );
  }
}
