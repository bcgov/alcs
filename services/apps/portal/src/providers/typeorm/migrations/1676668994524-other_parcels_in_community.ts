import { MigrationInterface, QueryRunner } from 'typeorm';

export class otherParcelsInCommunity1676668994524
  implements MigrationInterface
{
  name = 'otherParcelsInCommunity1676668994524';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "has_other_parcels_in_community" boolean`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."has_other_parcels_in_community" IS 'Indicates whether application owners have other parcels in the community.'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application"."has_other_parcels_in_community" IS 'Indicates whether application owners have other parcels in the community.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "has_other_parcels_in_community"`,
    );
  }
}
