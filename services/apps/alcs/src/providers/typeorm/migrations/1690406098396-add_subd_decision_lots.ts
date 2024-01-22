import { MigrationInterface, QueryRunner } from 'typeorm';

export class addSubdDecisionLots1690406098396 implements MigrationInterface {
  name = 'addSubdDecisionLots1690406098396';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ADD "subd_approved_lots" jsonb NOT NULL DEFAULT '[]'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision_component"."subd_approved_lots" IS 'JSONB Column containing the approved subdivision lots'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision_component"."subd_approved_lots" IS 'JSONB Column containing the approved subdivision lots'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" DROP COLUMN "subd_approved_lots"`,
    );
  }
}
