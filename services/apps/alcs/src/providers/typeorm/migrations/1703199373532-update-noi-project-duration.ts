import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateNoiProjectDuration1703199373532 implements MigrationInterface {
    name = 'UpdateNoiProjectDuration1703199373532'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_project_duration_amount"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_project_duration_unit"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "fill_project_duration_amount"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "fill_project_duration_unit"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_project_duration" text`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_submission" ADD "fill_project_duration" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "fill_project_duration"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "soil_project_duration"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_submission" ADD "fill_project_duration_unit" text`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_submission" ADD "fill_project_duration_amount" numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_project_duration_unit" text`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_submission" ADD "soil_project_duration_amount" numeric(12,2)`);
    }
}
