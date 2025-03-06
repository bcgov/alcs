import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameFinancialInstrumentEnums1741287102799 implements MigrationInterface {
  name = 'RenameFinancialInstrumentEnums1741287102799';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Application instrument types - direct rename
    await queryRunner.query(
      `ALTER TYPE "alcs"."application_decision_condition_financial_instrument_type_enum" RENAME TO "application_instrument_type"`,
    );
    await queryRunner.query(
      `ALTER TYPE "alcs"."application_decision_condition_financial_instrument_held_by_enu" RENAME TO "application_instrument_held_by"`,
    );
    await queryRunner.query(
      `ALTER TYPE "alcs"."application_decision_condition_financial_instrument_status_enum" RENAME TO "application_instrument_status"`,
    );

    // Notice of intent instrument types - direct rename
    await queryRunner.query(
      `ALTER TYPE "alcs"."notice_of_intent_decision_condition_financial_instrument_type_e" RENAME TO "noi_instrument_type"`,
    );
    await queryRunner.query(
      `ALTER TYPE "alcs"."notice_of_intent_decision_condition_financial_instrument_held_b" RENAME TO "noi_instrument_held_by"`,
    );
    await queryRunner.query(
      `ALTER TYPE "alcs"."notice_of_intent_decision_condition_financial_instrument_status" RENAME TO "noi_instrument_status"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert notice of intent instrument types - direct rename
    await queryRunner.query(
      `ALTER TYPE "alcs"."noi_instrument_status" RENAME TO "notice_of_intent_decision_condition_financial_instrument_status"`,
    );
    await queryRunner.query(
      `ALTER TYPE "alcs"."noi_instrument_held_by" RENAME TO "notice_of_intent_decision_condition_financial_instrument_held_b"`,
    );
    await queryRunner.query(
      `ALTER TYPE "alcs"."noi_instrument_type" RENAME TO "notice_of_intent_decision_condition_financial_instrument_type_e"`,
    );

    // Revert application instrument types - direct rename
    await queryRunner.query(
      `ALTER TYPE "alcs"."application_instrument_status" RENAME TO "application_decision_condition_financial_instrument_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "alcs"."application_instrument_held_by" RENAME TO "application_decision_condition_financial_instrument_held_by_enu"`,
    );
    await queryRunner.query(
      `ALTER TYPE "alcs"."application_instrument_type" RENAME TO "application_decision_condition_financial_instrument_type_enum"`,
    );
  }
}
