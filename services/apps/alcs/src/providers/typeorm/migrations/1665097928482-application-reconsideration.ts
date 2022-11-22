import { MigrationInterface, QueryRunner } from 'typeorm';

export class applicationReconsideration1665097928482
  implements MigrationInterface
{
  name = 'applicationReconsideration1665097928482';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "application_reconsideration" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "submitted_date" TIMESTAMP WITH TIME ZONE NOT NULL, "is_review_approved" boolean, "application_uuid" uuid NOT NULL, "review_date" TIMESTAMP WITH TIME ZONE, "card_uuid" uuid NOT NULL, "type_uuid" uuid NOT NULL, CONSTRAINT "REL_6d10e08b482effb968defe5535" UNIQUE ("card_uuid"), CONSTRAINT "PK_9aadf4188d47bd2ccf9b24e6ccb" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_reconsideration" ADD CONSTRAINT "FK_38dd9eddb8d8d72e50d28e876e3" FOREIGN KEY ("type_uuid") REFERENCES "reconsideration_type"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_reconsideration" ADD CONSTRAINT "FK_69f4ed0db8aa26fca099a85d3bd" FOREIGN KEY ("application_uuid") REFERENCES "application"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_reconsideration" ADD CONSTRAINT "FK_6d10e08b482effb968defe55357" FOREIGN KEY ("card_uuid") REFERENCES "card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_reconsideration" DROP CONSTRAINT "FK_6d10e08b482effb968defe55357"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_reconsideration" DROP CONSTRAINT "FK_69f4ed0db8aa26fca099a85d3bd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_reconsideration" DROP CONSTRAINT "FK_38dd9eddb8d8d72e50d28e876e3"`,
    );
    await queryRunner.query(`DROP TABLE "application_reconsideration"`);
  }
}
