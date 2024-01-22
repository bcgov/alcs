import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeCardUuidNullableForAppModification1704395559610
  implements MigrationInterface
{
  name = 'MakeCardUuidNullableForAppModification1704395559610';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_modification" DROP CONSTRAINT "FK_cd2e34439334004189a8767b960"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_modification" ALTER COLUMN "card_uuid" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_modification" ADD CONSTRAINT "FK_cd2e34439334004189a8767b960" FOREIGN KEY ("card_uuid") REFERENCES "alcs"."card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_modification" DROP CONSTRAINT "FK_cd2e34439334004189a8767b960"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_modification" ALTER COLUMN "card_uuid" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_modification" ADD CONSTRAINT "FK_cd2e34439334004189a8767b960" FOREIGN KEY ("card_uuid") REFERENCES "alcs"."card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
