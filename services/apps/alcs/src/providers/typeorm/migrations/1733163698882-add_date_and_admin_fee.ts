import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDateAndAdminFee1733163698882 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE "alcs"."application_decision_condition_type" SET "is_administrative_fee_amount_checked" = true, "date_type" = 'Single', "single_date_label" = 'Due Date' WHERE "code" NOT IN ('SRPT', 'UEND')`);
        await queryRunner.query(`UPDATE "alcs"."notice_of_intent_decision_condition_type" SET "is_administrative_fee_amount_checked" = true, "date_type" = 'Single', "single_date_label" = 'Due Date' WHERE "code" NOT IN ('SRPT', 'UEND')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // N/A
    }

}
