import { MigrationInterface, QueryRunner } from 'typeorm';

export class applicationStaffJournal1680029919626
  implements MigrationInterface
{
  name = 'applicationStaffJournal1680029919626';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_staff_journal" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "body" character varying NOT NULL, "edited" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "application_uuid" uuid NOT NULL, "author_uuid" uuid, CONSTRAINT "PK_f1511c9011c54e00e5b18b60324" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a074329b9f848c30b4165a7988" ON "alcs"."application_staff_journal" ("application_uuid") `,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_staff_journal" ADD CONSTRAINT "FK_4fd7ecf06dd0615a01f5e75b0f4" FOREIGN KEY ("author_uuid") REFERENCES "alcs"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_staff_journal" ADD CONSTRAINT "FK_a074329b9f848c30b4165a79889" FOREIGN KEY ("application_uuid") REFERENCES "alcs"."application"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_staff_journal" DROP CONSTRAINT "FK_a074329b9f848c30b4165a79889"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_staff_journal" DROP CONSTRAINT "FK_4fd7ecf06dd0615a01f5e75b0f4"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_a074329b9f848c30b4165a7988"`,
    );
    await queryRunner.query(`DROP TABLE "alcs"."application_staff_journal"`);
  }
}
