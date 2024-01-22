import { MigrationInterface, QueryRunner } from 'typeorm';

export class statusColorsInDb1689617772946 implements MigrationInterface {
  name = 'statusColorsInDb1689617772946';

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
      `ALTER TABLE "alcs"."application_submission_status_type" ADD "alcs_color" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission_status_type" ADD "portal_background_color" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission_status_type" ADD "portal_color" character varying`,
    );

    await queryRunner.query(
      `
      UPDATE "alcs"."application_submission_status_type"
      SET "portal_background_color" = '#acd2ed',
          "portal_color" = '#0c2e46'
      WHERE "code" IN ('PROG','REVG','REVA','RECA');

      UPDATE "alcs"."application_submission_status_type"
      SET "portal_background_color" = '#94c6ac',
          "portal_color" = '#002f17'
      WHERE "code" IN ('SUBM','SUBG','ALCD');

      UPDATE "alcs"."application_submission_status_type"
      SET "portal_background_color" = '#f8c0a3',
          "portal_color" = '#83360d'
      WHERE "code" IN ('INCM','WRNG','RFFG','SUIN');

      UPDATE "alcs"."application_submission_status_type"
      SET "portal_background_color" = '#efefef',
          "portal_color" = '#565656'
      WHERE "code" = 'CANC';
      `,
    );

    await queryRunner.query(
      `
      UPDATE "alcs"."application_submission_status_type"
      SET "alcs_background_color" = '#acd2ed',
          "alcs_color" = '#0c2e46'
      WHERE "code" IN ('SUBM','RFFG','REVG','SUBG');

      UPDATE "alcs"."application_submission_status_type"
      SET "alcs_background_color" = '#94c6ac',
          "alcs_color" = '#002f17'
      WHERE "code" IN ('ALCD','REVA','RECA','SUIN');

      UPDATE "alcs"."application_submission_status_type"
      SET "alcs_background_color" = '#fee9b5',
          "alcs_color" = '#313132'
      WHERE "code" IN ('PROG','INCM','WRNG');

      UPDATE "alcs"."application_submission_status_type"
      SET "alcs_background_color" = '#efefef',
          "alcs_color" = '#565656'
      WHERE "code" = 'CANC';
      `,
    );

    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission_status_type" ALTER COLUMN "alcs_background_color" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission_status_type" ALTER COLUMN "alcs_color" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission_status_type" ALTER COLUMN "portal_background_color" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission_status_type" ALTER COLUMN "portal_color" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // nope
  }
}
