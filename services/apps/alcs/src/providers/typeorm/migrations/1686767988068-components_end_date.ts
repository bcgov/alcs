import { MigrationInterface, QueryRunner } from 'typeorm';

export class componentsEndDate1686767988068 implements MigrationInterface {
  name = 'componentsEndDate1686767988068';

  public async up(queryRunner: QueryRunner): Promise<void> {
    
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" RENAME COLUMN "nfu_end_date" TO "end_date"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision_component"."end_date" IS 'Components\` end date'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_decision_component"."end_date" IS 'The date at which the non-farm use ends'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" RENAME COLUMN "end_date" TO "nfu_end_date"`,
    );
    
  }
}
