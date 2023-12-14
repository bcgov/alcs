import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCrownlandtypeToOwner1702486285892
  implements MigrationInterface
{
  name = 'AddCrownlandtypeToOwner1702486285892';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" ADD "crown_land_owner_type" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD "crown_land_owner_type" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_owner" ADD "crown_land_owner_type" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" ADD "crown_land_owner_type" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "crown_land_owner_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_owner" DROP COLUMN "crown_land_owner_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP COLUMN "crown_land_owner_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_owner" DROP COLUMN "crown_land_owner_type"`,
    );
  }
}
