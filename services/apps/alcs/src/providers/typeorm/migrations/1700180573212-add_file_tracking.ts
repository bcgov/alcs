import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFileTracking1700180573212 implements MigrationInterface {
  name = 'AddFileTracking1700180573212';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."file_viewed" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "file_number" character varying NOT NULL, "user_uuid" character varying NOT NULL, "viewed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f1265be167cb82e9e3828df45d1" PRIMARY KEY ("uuid"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "alcs"."file_viewed"`);
  }
}
