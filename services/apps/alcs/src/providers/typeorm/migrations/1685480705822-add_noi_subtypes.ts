import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNoiSubtypes1685480705822 implements MigrationInterface {
  name = 'addNoiSubtypes1685480705822';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."notice_of_intent_subtype" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_40bfe70c649368a23bcddc640c6" UNIQUE ("description"), CONSTRAINT "PK_4a13dbcfd0cf37ce05c060ab1ab" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."notice_of_intent_subtype_notice_of_intent_subtype" ("notice_of_intent_uuid" uuid NOT NULL, "notice_of_intent_subtype_code" text NOT NULL, CONSTRAINT "PK_e87031b2679591a4be7a2d91b3f" PRIMARY KEY ("notice_of_intent_uuid", "notice_of_intent_subtype_code"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6f01212893c055cb309c67cb74" ON "alcs"."notice_of_intent_subtype_notice_of_intent_subtype" ("notice_of_intent_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_db6e5772413f492798d45150c0" ON "alcs"."notice_of_intent_subtype_notice_of_intent_subtype" ("notice_of_intent_subtype_code") `,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_subtype_notice_of_intent_subtype" ADD CONSTRAINT "FK_6f01212893c055cb309c67cb74b" FOREIGN KEY ("notice_of_intent_uuid") REFERENCES "alcs"."notice_of_intent"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_subtype_notice_of_intent_subtype" ADD CONSTRAINT "FK_db6e5772413f492798d45150c0d" FOREIGN KEY ("notice_of_intent_subtype_code") REFERENCES "alcs"."notice_of_intent_subtype"("code") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_subtype_notice_of_intent_subtype" DROP CONSTRAINT "FK_db6e5772413f492798d45150c0d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_subtype_notice_of_intent_subtype" DROP CONSTRAINT "FK_6f01212893c055cb309c67cb74b"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_db6e5772413f492798d45150c0"`,
    );
    await queryRunner.query(
      `DROP INDEX "alcs"."IDX_6f01212893c055cb309c67cb74"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."notice_of_intent_subtype_notice_of_intent_subtype"`,
    );
    await queryRunner.query(`DROP TABLE "alcs"."notice_of_intent_subtype"`);
  }
}
