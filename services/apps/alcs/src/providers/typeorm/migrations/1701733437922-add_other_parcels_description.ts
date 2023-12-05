import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOtherParcelsDescription1701733437922
  implements MigrationInterface
{
  name = 'AddOtherParcelsDescription1701733437922';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "other_parcels_description" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "alcs"."application_submission"."other_parcels_description" IS 'Stores the data user entered about other parcels in their community'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "other_parcels_description"`,
    );
  }
}
