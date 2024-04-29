import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveParcelOwnershiptype1713299422987
  implements MigrationInterface
{
  name = 'RemoveParcelOwnershiptype1713299422987';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_parcel" DROP COLUMN "crown_land_owner_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" DROP COLUMN "crown_land_owner_type"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_parcel" ADD "crown_land_owner_type" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_parcel" ADD "crown_land_owner_type" text`,
    );
  }
}
