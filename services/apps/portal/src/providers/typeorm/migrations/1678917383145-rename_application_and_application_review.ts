import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameApplicationAndApplicationReview1678917383145
  implements MigrationInterface
{
  name = 'renameApplicationAndApplicationReview1678917383145';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application" RENAME TO "application_proposal"`,
    );

    await queryRunner.query(
      `ALTER TABLE "portal"."application_review" RENAME TO "application_proposal_review"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
