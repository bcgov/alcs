import { MigrationInterface, QueryRunner } from 'typeorm';

export class commentMentions1660597012174 implements MigrationInterface {
  name = 'commentMentions1660597012174';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "comment_mention" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "comment_uuid" uuid NOT NULL, "user_uuid" uuid NOT NULL, "mention_label" character varying NOT NULL, CONSTRAINT "PK_feed00139ed51070bcebe19773f" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_mention" ADD CONSTRAINT "FK_e93e63158f6402819a1bcf77216" FOREIGN KEY ("comment_uuid") REFERENCES "comment"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_mention" ADD CONSTRAINT "FK_15ec79570aca5e00f9c102ae1a0" FOREIGN KEY ("user_uuid") REFERENCES "user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comment_mention" DROP CONSTRAINT "FK_15ec79570aca5e00f9c102ae1a0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_mention" DROP CONSTRAINT "FK_e93e63158f6402819a1bcf77216"`,
    );
    await queryRunner.query(`DROP TABLE "comment_mention"`);
  }
}
