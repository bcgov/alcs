import { MigrationInterface, QueryRunner } from 'typeorm';

export class addBoards1661374006987 implements MigrationInterface {
  name = 'addBoards1661374006987';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "board_status" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "order" integer NOT NULL, "board_uuid" uuid, "status_uuid" uuid, CONSTRAINT "PK_011eeedcd1eb7802ad33e26a32c" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "board" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "code" character varying NOT NULL, "title" character varying NOT NULL, "decision_maker" character varying NOT NULL, CONSTRAINT "UQ_677fd48b030e8ba19b2c0f1f8b6" UNIQUE ("code"), CONSTRAINT "PK_cd77b28e379de081c2b733b3f08" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(`ALTER TABLE "application" ADD "board_uuid" uuid`);
    await queryRunner.query(
      `ALTER TABLE "board_status" ADD CONSTRAINT "FK_30cd0aba1ecf48c3687eaa215e1" FOREIGN KEY ("board_uuid") REFERENCES "board"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_status" ADD CONSTRAINT "FK_97cd2800c2e17e3cb8c24c78987" FOREIGN KEY ("status_uuid") REFERENCES "application_status"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD CONSTRAINT "FK_fe6c9e8b98e3f649b598710dfce" FOREIGN KEY ("board_uuid") REFERENCES "board"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application" DROP CONSTRAINT "FK_fe6c9e8b98e3f649b598710dfce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_status" DROP CONSTRAINT "FK_97cd2800c2e17e3cb8c24c78987"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_status" DROP CONSTRAINT "FK_30cd0aba1ecf48c3687eaa215e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP COLUMN "board_uuid"`,
    );
    await queryRunner.query(`DROP TABLE "board"`);
    await queryRunner.query(`DROP TABLE "board_status"`);
  }
}
