import { MigrationInterface, QueryRunner } from 'typeorm';

export class addAmendments1666891409057 implements MigrationInterface {
  name = 'addAmendments1666891409057';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "application_amendment" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "submitted_date" TIMESTAMP WITH TIME ZONE NOT NULL, "is_review_approved" boolean, "is_time_extension" boolean NOT NULL, "review_date" TIMESTAMP WITH TIME ZONE, "card_uuid" uuid NOT NULL, "application_uuid" uuid NOT NULL, CONSTRAINT "REL_673f2b816b3ef5e11c8c1e0e98" UNIQUE ("card_uuid"), CONSTRAINT "PK_f11ed60b151cc0ea4f1862eca19" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_amendment" ADD CONSTRAINT "FK_673f2b816b3ef5e11c8c1e0e980" FOREIGN KEY ("card_uuid") REFERENCES "card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_amendment" ADD CONSTRAINT "FK_3e941d0e00fafdb9830799dc804" FOREIGN KEY ("application_uuid") REFERENCES "application"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_amendment" DROP CONSTRAINT "FK_3e941d0e00fafdb9830799dc804"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_amendment" DROP CONSTRAINT "FK_673f2b816b3ef5e11c8c1e0e980"`,
    );
    await queryRunner.query(`DROP TABLE "application_amendment"`);
  }
}
