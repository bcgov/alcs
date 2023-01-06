import { MigrationInterface, QueryRunner } from 'typeorm';

export class addPortalHtmlDescriptionToCardType1672943029573
  implements MigrationInterface
{
  name = 'addPortalHtmlDescriptionToCardType1672943029573';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."card_type" ADD "portal_html_description" text NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."card_type" DROP COLUMN "portal_html_description"`,
    );
  }
}
