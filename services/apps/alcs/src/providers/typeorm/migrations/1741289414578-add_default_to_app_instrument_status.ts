import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDefaultToAppInstrumentStatus1741289414578 implements MigrationInterface {
    name = 'AddDefaultToAppInstrumentStatus1741289414578'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_financial_instrument" ALTER COLUMN "status" SET DEFAULT 'Received'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_condition_financial_instrument" ALTER COLUMN "status" DROP DEFAULT`);
    }

}
