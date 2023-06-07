import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeNoiOutcomeFirstDecision1686166177818
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "alcs"."notice_of_intent_decision_outcome" DROP COLUMN "is_first_decision";  
    `);

    await queryRunner.query(`
      UPDATE "alcs"."notice_of_intent_decision" SET "outcome_code" = 'APPR';
    `);

    //Remove 60 day option
    await queryRunner.query(`
      DELETE FROM "alcs"."notice_of_intent_decision_outcome" WHERE "code" = 'PO6D';
    `);
  }

  public async down(): Promise<void> {
    //No
  }
}
