import { MigrationInterface, QueryRunner } from 'typeorm';

export class cardEntityPart61663878764997 implements MigrationInterface {
  name = 'cardEntityPart61663878764997';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "card_type" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_30b9e07ab7c729f90911604179f" UNIQUE ("code"), CONSTRAINT "UQ_715d4a7d408c461949a6f007a71" UNIQUE ("description"), CONSTRAINT "PK_5a9e11f5a58d23866e129e6981d" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `
      INSERT INTO public.card_type (uuid,audit_deleted_date_at,audit_created_at,audit_updated_at,audit_created_by,audit_updated_by,"label",code,description) VALUES
	 ('f6df265f-3163-4201-858a-87d4fbd75cbe',NULL,'2022-09-22 13:52:12.366',NULL,'migration_seed',NULL,'Application','APP','Application type card');
      `,
    );
    await queryRunner.query(
      `ALTER TABLE "card" ADD "type_uuid" uuid NOT NULL DEFAULT 'f6df265f-3163-4201-858a-87d4fbd75cbe'`,
    );
    await queryRunner.query(
      `ALTER TABLE "card" ADD CONSTRAINT "FK_5a9e11f5a58d23866e129e6981d" FOREIGN KEY ("type_uuid") REFERENCES "card_type"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "card" DROP CONSTRAINT "FK_5a9e11f5a58d23866e129e6981d"`,
    );
    await queryRunner.query(`ALTER TABLE "card" DROP COLUMN "type_uuid"`);
    await queryRunner.query(`DROP TABLE "card_type"`);
  }
}
