import { MigrationInterface, QueryRunner } from "typeorm";

export class FixConditionTypeDateField1734024626850 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE "alcs"."application_decision_condition_type" SET "is_date_checked" = true, "single_date_label" = 'Due Date' WHERE "code" NOT IN ('SRPT', 'UEND')`);
        await queryRunner.query(`UPDATE "alcs"."notice_of_intent_decision_condition_type" SET "is_date_checked" = true, "single_date_label" = 'Due Date' WHERE "code" NOT IN ('SRPT', 'UEND')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // N/A
    }

}
