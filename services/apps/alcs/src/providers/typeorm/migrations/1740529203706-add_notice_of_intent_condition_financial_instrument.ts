import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNoticeOfIntentConditionFinancialInstrument1740529203706 implements MigrationInterface {
  name = 'AddNoticeOfIntentConditionFinancialInstrument1740529203706';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "alcs"."notice_of_intent_decision_condition_financial_instrument_type_enum" AS ENUM('Bank Draft', 'Certified Cheque', 'EFT', 'Irrevocable Letter of Credit', 'Other', 'Safekeeping Agreement')`,
    );
    await queryRunner.query(
      `CREATE TYPE "alcs"."notice_of_intent_decision_condition_financial_instrument_held_by_enum" AS ENUM('ALC', 'Ministry')`,
    );
    await queryRunner.query(
      `CREATE TYPE "alcs"."notice_of_intent_decision_condition_financial_instrument_status_enum" AS ENUM('Received', 'Released', 'Cashed', 'Replaced')`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."notice_of_intent_decision_condition_financial_instrument" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "security_holder_payee" character varying NOT NULL, "type" "alcs"."notice_of_intent_decision_condition_financial_instrument_type_enum" NOT NULL, "issue_date" TIMESTAMP WITH TIME ZONE NOT NULL, "expiry_date" TIMESTAMP WITH TIME ZONE, "amount" numeric(12,2) NOT NULL, "bank" character varying NOT NULL, "instrument_number" character varying, "held_by" "alcs"."notice_of_intent_decision_condition_financial_instrument_held_by_enum" NOT NULL, "received_date" TIMESTAMP WITH TIME ZONE NOT NULL, "notes" text, "status" "alcs"."notice_of_intent_decision_condition_financial_instrument_status_enum" NOT NULL DEFAULT 'Received', "status_date" TIMESTAMP WITH TIME ZONE, "explanation" text, "condition_uuid" uuid, CONSTRAINT "PK_cd31b04c238e6ccf3e6ac3e37f0" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_decision_condition_financial_instrument" IS 'Instrument for Financial Security Conditions'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_financial_instrument" ADD CONSTRAINT "FK_6dfce6b06252ca93fb88a21c471" FOREIGN KEY ("condition_uuid") REFERENCES "alcs"."notice_of_intent_decision_condition"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."notice_of_intent_decision_condition_financial_instrument" DROP CONSTRAINT "FK_6dfce6b06252ca93fb88a21c471"`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."notice_of_intent_decision_condition_financial_instrument" IS NULL`,
    );
    await queryRunner.query(`DROP TABLE "alcs"."notice_of_intent_decision_condition_financial_instrument"`);
    await queryRunner.query(`DROP TYPE "alcs"."notice_of_intent_decision_condition_financial_instrument_status_enum"`);
    await queryRunner.query(`DROP TYPE "alcs"."notice_of_intent_decision_condition_financial_instrument_held_by_enum"`);
    await queryRunner.query(`DROP TYPE "alcs"."notice_of_intent_decision_condition_financial_instrument_type_enum"`);
  }
}
