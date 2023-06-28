import { MigrationInterface, QueryRunner } from 'typeorm';

export class proposalExpiryDate1687547808637 implements MigrationInterface {
  name = 'proposalExpiryDate1687547808637';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" ADD "proposal_expiry_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application"."proposal_expiry_date" IS 'The date at which the proposal expires'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application"."proposal_expiry_date" IS 'The date at which the proposal expires'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" DROP COLUMN "proposal_expiry_date"`,
    );
  }
}
