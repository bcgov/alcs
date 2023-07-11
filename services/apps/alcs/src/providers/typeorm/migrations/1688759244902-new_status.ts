import { MigrationInterface, QueryRunner } from 'typeorm';

export class newStatus1688759244902 implements MigrationInterface {
  name = 'newStatus1688759244902';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application" DROP COLUMN "status_history"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "status_history"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP CONSTRAINT "FK_d2fb7c905282b86706cad8ef0ab"`,
    );

    // TODO: move this to migration after migrating existing statuses to new structure
    // await queryRunner.query(
    //   `ALTER TABLE "alcs"."application_submission" DROP COLUMN "status_code"`,
    // );

    await queryRunner.query(
      `CREATE TABLE "alcs"."application_submission_to_submission_status" ("effective_date" TIMESTAMP WITH TIME ZONE, "submission_uuid" uuid NOT NULL, "status_type_code" text NOT NULL, CONSTRAINT "PK_2aedecbaaf7b78b680dd5860c6b" PRIMARY KEY ("submission_uuid", "status_type_code"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission_to_submission_status" ADD CONSTRAINT "FK_9b9f3f74a8502b01bbf93bd7b77" FOREIGN KEY ("submission_uuid") REFERENCES "alcs"."application_submission"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission_to_submission_status" ADD CONSTRAINT "FK_cc4b3297a2927c718987ec1a930" FOREIGN KEY ("status_type_code") REFERENCES "alcs"."submission_status_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // nope
  }
}
