import { MigrationInterface, QueryRunner } from 'typeorm';

export class adjustColumnComments1691525221371 implements MigrationInterface {
  name = 'adjustColumnComments1691525221371';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."local_government" DROP CONSTRAINT "FK_b7e4525de796ada01f43f464d9d"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_submission"."purpose" IS 'The purpose of the application'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."notice_of_intent_submission"."purpose" IS 'The Applicants name on the application'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."local_government" ADD CONSTRAINT "FK_b7e4525de796ada01f43f464d9d" FOREIGN KEY ("preferred_region_code") REFERENCES "alcs"."application_region"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
