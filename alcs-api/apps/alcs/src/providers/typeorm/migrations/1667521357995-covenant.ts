import { MigrationInterface, QueryRunner } from 'typeorm';

export class covenant1667521357995 implements MigrationInterface {
  name = 'covenant1667521357995';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "covenant" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "file_number" character varying NOT NULL, "applicant" character varying NOT NULL, "card_uuid" uuid NOT NULL, "local_government_uuid" uuid NOT NULL, "region_code" text NOT NULL, CONSTRAINT "UQ_a5dfb1e8f2d584102ea62cc2eed" UNIQUE ("file_number"), CONSTRAINT "REL_4dbfa43fa598901ae71504afab" UNIQUE ("card_uuid"), CONSTRAINT "PK_cefaa63a1ab0918cbda7dc123aa" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "covenant" ADD CONSTRAINT "FK_4dbfa43fa598901ae71504afabf" FOREIGN KEY ("card_uuid") REFERENCES "card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "covenant" ADD CONSTRAINT "FK_0fa742d800bc0e0b3f2451e0f0b" FOREIGN KEY ("local_government_uuid") REFERENCES "application_local_government"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "covenant" ADD CONSTRAINT "FK_a62eb808822aabedb56e1c9d928" FOREIGN KEY ("region_code") REFERENCES "application_region"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "covenant" DROP CONSTRAINT "FK_a62eb808822aabedb56e1c9d928"`,
    );
    await queryRunner.query(
      `ALTER TABLE "covenant" DROP CONSTRAINT "FK_0fa742d800bc0e0b3f2451e0f0b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "covenant" DROP CONSTRAINT "FK_4dbfa43fa598901ae71504afabf"`,
    );
    await queryRunner.query(`DROP TABLE "covenant"`);
  }
}
