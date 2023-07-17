import { MigrationInterface, QueryRunner } from 'typeorm';

export class statusColoursInDb1689617772946 implements MigrationInterface {
  name = 'statusColoursInDb1689617772946';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        UPDATE "alcs"."application_submission_status_type"
        SET "label" = 'Under Review by L/FNG'
        WHERE "code" = 'REVG';
      `,
    );

    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission_status_type" ADD "alcs_background_color" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission_status_type" ADD "alcs_text_color" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission_status_type" ADD "portal_background_color" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission_status_type" ADD "portal_text_color" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // nope
  }
}
