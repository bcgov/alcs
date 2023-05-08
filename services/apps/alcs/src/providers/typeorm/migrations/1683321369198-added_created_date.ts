import { MigrationInterface, QueryRunner } from 'typeorm';

export class addedCreatedDate1683321369198 implements MigrationInterface {
  name = 'addedCreatedDate1683321369198';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `UPDATE "alcs".application_decision
        set created_at = audit_created_at;`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision"."created_at" IS 'Date that indicates when decision was created. It is not editable by user.'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP COLUMN "created_at"`,
    );
  }
}
