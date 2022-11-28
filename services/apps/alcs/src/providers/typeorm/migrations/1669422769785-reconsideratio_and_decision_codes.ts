import { MigrationInterface, QueryRunner } from 'typeorm';

export class reconsideratioAndDecisionCodes1669422769785
  implements MigrationInterface
{
  name = 'reconsideratioAndDecisionCodes1669422769785';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP CONSTRAINT "FK_e88e4a5dc4db0a7ba934b99dbe0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsideration" ADD "reconsiders_decisions_code" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD CONSTRAINT "FK_dc34f50291af0299bd44e8d0448" FOREIGN KEY ("chair_review_outcome_code") REFERENCES "alcs"."application_decision_chair_review_outcome_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP CONSTRAINT "FK_dc34f50291af0299bd44e8d0448"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsideration" DROP COLUMN "reconsiders_decisions_code"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD CONSTRAINT "FK_e88e4a5dc4db0a7ba934b99dbe0" FOREIGN KEY ("chair_review_outcome_code") REFERENCES "alcs"."application_decision_chair_review_outcome_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
