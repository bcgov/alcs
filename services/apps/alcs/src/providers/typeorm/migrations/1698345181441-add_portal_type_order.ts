import { MigrationInterface, QueryRunner } from 'typeorm';

export class addPortalTypeOrder1698345181441 implements MigrationInterface {
  name = 'addPortalTypeOrder1698345181441';

  public async up(queryRunner: QueryRunner): Promise<void> {
    //Add Order
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_type" ADD "portal_order" integer`,
    );

    //Populate Order
    await queryRunner.query(
      `UPDATE "alcs"."application_type" SET "portal_order" = '0' WHERE "code" = 'INCL';`,
    );
    await queryRunner.query(
      `UPDATE "alcs"."application_type" SET "portal_order" = '1' WHERE "code" = 'NARU';`,
    );
    await queryRunner.query(
      `UPDATE "alcs"."application_type" SET "portal_order" = '2' WHERE "code" = 'POFO';`,
    );
    await queryRunner.query(
      `UPDATE "alcs"."application_type" SET "portal_order" = '3' WHERE "code" = 'PFRS';`,
    );
    await queryRunner.query(
      `UPDATE "alcs"."application_type" SET "portal_order" = '4' WHERE "code" = 'ROSO';`,
    );
    await queryRunner.query(
      `UPDATE "alcs"."application_type" SET "portal_order" = '5' WHERE "code" = 'NFUP';`,
    );
    await queryRunner.query(
      `UPDATE "alcs"."application_type" SET "portal_order" = '6' WHERE "code" = 'SUBD';`,
    );
    await queryRunner.query(
      `UPDATE "alcs"."application_type" SET "portal_order" = '7' WHERE "code" = 'TURP';`,
    );
    await queryRunner.query(
      `UPDATE "alcs"."application_type" SET "portal_order" = '8' WHERE "code" = 'EXCL';`,
    );
    await queryRunner.query(
      `UPDATE "alcs"."application_type" SET "portal_order" = '9' WHERE "code" = 'COVE';`,
    );

    //Make Not Nullable
    await queryRunner.query(`
      ALTER TABLE "alcs"."application_type" ALTER COLUMN "portal_order" SET NOT NULL;
    `);

    //Update Description
    await queryRunner.query(`
      UPDATE "alcs"."card_type" SET "portal_html_description" = 'Create an <a target="_blank" href="https://www.alc.gov.bc.ca/application-and-notice-process/applications/">Application</a> if you are proposing to exclude, include, subdivide, conduct a non-farm use activity, conduct a non-adhering residential use, conduct a transportation/utility/recreational trail use, or conduct a soil or fill use, or register a restrictive covenant. Non-adhering residential use applications have a fee of $750. All other applications have a fee of $1,500 fee, except for inclusion of land and registering a restrictive covenant (no fee). Application fees are split equally between the local government and the ALC.' WHERE "code" = 'APP';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_type" DROP COLUMN "portal_order"`,
    );
  }
}
