import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNotifications1661212105720 implements MigrationInterface {
  name = 'addNotifications1661212105720';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "notification" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "receiver_uuid" uuid NOT NULL, "title" character varying NOT NULL, "body" character varying NOT NULL, "read" boolean NOT NULL DEFAULT false, "target_type" character varying NOT NULL, "link" character varying NOT NULL, "actor_uuid" uuid, CONSTRAINT "PK_b9fa421f94f7707ba109bf73b82" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_fc0e9a26b0a8f7c76658ca1c6ca" FOREIGN KEY ("actor_uuid") REFERENCES "user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_b776eec36c2a6b6879c14241e91" FOREIGN KEY ("receiver_uuid") REFERENCES "user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_b776eec36c2a6b6879c14241e91"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_fc0e9a26b0a8f7c76658ca1c6ca"`,
    );
    await queryRunner.query(`DROP TABLE "notification"`);
  }
}
