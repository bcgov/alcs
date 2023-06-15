import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNaruSubtype1686862115596 implements MigrationInterface {
  name = 'addNaruSubtype1686862115596';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" RENAME COLUMN "naru_subtype" TO "naru_subtype_code"`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."naru_subtype" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_629710d76c4058afacd2e44b3f4" UNIQUE ("description"), CONSTRAINT "PK_0e11b61ce5ebd61e65627107d6b" PRIMARY KEY ("code"))`,
    );

    await queryRunner.query(`
      INSERT INTO "alcs"."naru_subtype"
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
        (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Additional Residence for Farm Use', 'ARFU', 'Additional Residence for Farm Use'),
        (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Principal Residence More Than 500m²', 'PRIN', 'Principal Residence More Than 500m²'),
        (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Non-Adhering Tourism Accommodation', 'TOUR', 'Non-Adhering Tourism Accommodation');
    `);

    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" ADD CONSTRAINT "FK_7dda468067bcf0cf6be0ec43db5" FOREIGN KEY ("naru_subtype_code") REFERENCES "alcs"."naru_subtype"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" DROP CONSTRAINT "FK_7dda468067bcf0cf6be0ec43db5"`,
    );
    await queryRunner.query(`DROP TABLE "alcs"."naru_subtype"`);
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_submission" RENAME COLUMN "naru_subtype_code" TO "naru_subtype"`,
    );
  }
}
