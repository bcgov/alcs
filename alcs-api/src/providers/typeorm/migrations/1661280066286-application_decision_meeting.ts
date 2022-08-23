import { MigrationInterface, QueryRunner } from 'typeorm';

export class applicationDecisionMeeting1661280066286
  implements MigrationInterface
{
  name = 'applicationDecisionMeeting1661280066286';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "application_decision_meeting" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "application_uuid" uuid, CONSTRAINT "PK_f8239cd4da09e40ee76649bf85a" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision_meeting" ADD CONSTRAINT "FK_8629d5787d89267d417dcbb369b" FOREIGN KEY ("application_uuid") REFERENCES "application"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_decision_meeting" DROP CONSTRAINT "FK_8629d5787d89267d417dcbb369b"`,
    );
    await queryRunner.query(`DROP TABLE "application_decision_meeting"`);
  }
}
