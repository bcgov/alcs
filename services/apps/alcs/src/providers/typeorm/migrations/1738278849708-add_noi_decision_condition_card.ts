import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNoiDecisionConditionCard1738278849708 implements MigrationInterface {
  name = 'AddNoiDecisionConditionCard1738278849708';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."notice_of_intent_decision_condition_card" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "card_uuid" uuid NOT NULL, "decision_uuid" uuid NOT NULL, CONSTRAINT "REL_f5487b5d4edd09dba2417b266c" UNIQUE ("card_uuid"), CONSTRAINT "PK_f8b06cd95cf71b53a6da5bfbb7d" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_decision_condition_card" IS 'Links notice of intent decision conditions with cards'`,
    );
    await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision_condition" ADD "condition_card_uuid" uuid`);
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_card" ADD CONSTRAINT "FK_f5487b5d4edd09dba2417b266c6" FOREIGN KEY ("card_uuid") REFERENCES "alcs"."card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_card" ADD CONSTRAINT "FK_7cf55f3865a915283960cae1eb0" FOREIGN KEY ("decision_uuid") REFERENCES "alcs"."notice_of_intent_decision"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition" ADD CONSTRAINT "FK_a7c48dd8395ba0555ae90dca0cf" FOREIGN KEY ("condition_card_uuid") REFERENCES "alcs"."notice_of_intent_decision_condition_card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition" DROP CONSTRAINT "FK_a7c48dd8395ba0555ae90dca0cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_card" DROP CONSTRAINT "FK_7cf55f3865a915283960cae1eb0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_card" DROP CONSTRAINT "FK_f5487b5d4edd09dba2417b266c6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition" DROP COLUMN "condition_card_uuid"`,
    );
    await queryRunner.query(`COMMENT ON TABLE "alcs"."notice_of_intent_decision_condition_card" IS NULL`);
    await queryRunner.query(`DROP TABLE "alcs"."notice_of_intent_decision_condition_card"`);
  }
}
