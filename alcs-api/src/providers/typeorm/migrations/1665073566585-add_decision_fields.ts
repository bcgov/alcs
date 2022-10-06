import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDecisionFields1665073566585 implements MigrationInterface {
  name = 'addDecisionFields1665073566585';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD "audit_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD "chair_review_required" boolean NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD "chair_review_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_subtask" ALTER COLUMN "card_uuid" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_document" ALTER COLUMN "application_uuid" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ALTER COLUMN "card_uuid" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application" ALTER COLUMN "card_uuid" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_document" ALTER COLUMN "application_uuid" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_subtask" ALTER COLUMN "card_uuid" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP COLUMN "chair_review_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP COLUMN "chair_review_required"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP COLUMN "audit_date"`,
    );
  }
}
