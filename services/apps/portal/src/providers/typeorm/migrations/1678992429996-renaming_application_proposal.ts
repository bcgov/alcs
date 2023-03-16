import { MigrationInterface, QueryRunner } from 'typeorm';

export class renamingApplicationProposal1678992429996
  implements MigrationInterface
{
  name = 'renamingApplicationProposal1678992429996';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application_proposal" RENAME TO "application_submission"`,
    );

    await queryRunner.query(
      `ALTER TABLE "portal"."application_proposal_review" RENAME TO "application_submission_review"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
