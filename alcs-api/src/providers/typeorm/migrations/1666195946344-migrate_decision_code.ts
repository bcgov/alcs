import { MigrationInterface, QueryRunner } from 'typeorm';

export class migrateDecisionCode1666195946344 implements MigrationInterface {
  name = 'migrateDecisionCode1666195946344';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP CONSTRAINT "FK_cd7126f6177b068f58e05d47b8f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "decision_outcome_code" DROP CONSTRAINT "PK_cd7126f6177b068f58e05d47b8f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD "outcome_code" text`,
    );
    await queryRunner.query(
      `UPDATE "application_decision" SET "outcome_code" = "decision_outcome_code".code FROM "decision_outcome_code" WHERE "application_decision"."outcome_uuid" = "decision_outcome_code".uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "decision_outcome_code" DROP COLUMN "uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP COLUMN "outcome_uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "decision_outcome_code" ADD CONSTRAINT "PK_6601a2660a07574e6a960efbc07" PRIMARY KEY ("code")`,
    );
    await queryRunner.query(
      `ALTER TABLE "decision_outcome_code" DROP CONSTRAINT "UQ_d00682751a3d4cdd7c9a16ab041"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD CONSTRAINT "FK_d00682751a3d4cdd7c9a16ab041" FOREIGN KEY ("outcome_code") REFERENCES "decision_outcome_code"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //Lost information!
  }
}
