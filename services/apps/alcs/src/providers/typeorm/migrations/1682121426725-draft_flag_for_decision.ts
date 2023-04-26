import { MigrationInterface, QueryRunner } from 'typeorm';

export class draftFlagForDecision1682121426725 implements MigrationInterface {
  name = 'draftFlagForDecision1682121426725';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD "is_draft" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision"."is_draft" IS 'Indicates whether the decision is currently draft or not'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision"."is_draft" IS 'Indicates whether the decision is currently draft or not'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP COLUMN "is_draft"`,
    );
  }
}
