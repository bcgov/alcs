import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTurFields1678404866307 implements MigrationInterface {
  name = 'addTurFields1678404866307';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "tur_purpose" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "tur_agricultural_activities" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "tur_reduce_negative_impacts" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "tur_outside_lands" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "tur_total_corridor_area" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" ADD "tur_all_owners_notified" boolean`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "tur_all_owners_notified"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "tur_total_corridor_area"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "tur_outside_lands"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "tur_reduce_negative_impacts"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "tur_agricultural_activities"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application" DROP COLUMN "tur_purpose"`,
    );
  }
}
