import { MigrationInterface, QueryRunner } from 'typeorm';

export class cardEntityPart41663798165421 implements MigrationInterface {
  name = 'cardEntityPart41663798165421';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_fbbc6f68cb51279ecde6d12a890"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fbbc6f68cb51279ecde6d12a89"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" RENAME COLUMN "application_uuid" TO "card_uuid"`,
    );
    await queryRunner.query(
      `CREATE TABLE "card_subtask" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "completed_at" TIMESTAMP WITH TIME ZONE, "assignee_uuid" uuid, "card_uuid" uuid, "type_uuid" uuid, CONSTRAINT "PK_1196033d1dfc3f1f0d102eb9a6a" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_acb37fb28b6e19312217e12aaa" ON "comment" ("card_uuid") `,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_acb37fb28b6e19312217e12aaa2" FOREIGN KEY ("card_uuid") REFERENCES "card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_subtask" ADD CONSTRAINT "FK_35829d0ec7a6e71391c2349188f" FOREIGN KEY ("assignee_uuid") REFERENCES "user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_subtask" ADD CONSTRAINT "FK_27ad2b929d07d4c4e43943f8e62" FOREIGN KEY ("card_uuid") REFERENCES "card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_subtask" ADD CONSTRAINT "FK_b2ea292f93c675defa3b3cc93dd" FOREIGN KEY ("type_uuid") REFERENCES "application_subtask_type"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "card_subtask" DROP CONSTRAINT "FK_b2ea292f93c675defa3b3cc93dd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_subtask" DROP CONSTRAINT "FK_27ad2b929d07d4c4e43943f8e62"`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_subtask" DROP CONSTRAINT "FK_35829d0ec7a6e71391c2349188f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_acb37fb28b6e19312217e12aaa2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_acb37fb28b6e19312217e12aaa"`,
    );
    await queryRunner.query(`DROP TABLE "card_subtask"`);
    await queryRunner.query(
      `ALTER TABLE "comment" RENAME COLUMN "card_uuid" TO "application_uuid"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fbbc6f68cb51279ecde6d12a89" ON "comment" ("application_uuid") `,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_fbbc6f68cb51279ecde6d12a890" FOREIGN KEY ("application_uuid") REFERENCES "application"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
