import { MigrationInterface, QueryRunner } from 'typeorm';

export class addLocalGovernment1664490448266 implements MigrationInterface {
  name = 'addLocalGovernment1664490448266';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "application_local_government" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "name" character varying NOT NULL, "preferred_region_uuid" uuid NOT NULL, CONSTRAINT "PK_58853fcb8957e8b2c131cc12da1" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_local_government" ADD CONSTRAINT "FK_a97bb512509e0637e03fa9812f3" FOREIGN KEY ("preferred_region_uuid") REFERENCES "application_region"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_local_government" DROP CONSTRAINT "FK_a97bb512509e0637e03fa9812f3"`,
    );
    await queryRunner.query(`DROP TABLE "application_local_government"`);
  }
}
