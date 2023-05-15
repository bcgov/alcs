import { MigrationInterface, QueryRunner } from "typeorm";

export class fixTypoInDecisionComponent1683936016011 implements MigrationInterface {
    name = 'fixTypoInDecisionComponent1683936016011'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_component" DROP COLUMN "nfu_use_type"`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_component" DROP COLUMN "nfu_use_sub_type"`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_component" ADD "nfu_type" text`);
        await queryRunner.query(`COMMENT ON COLUMN "alcs"."application_decision_component"."nfu_type" IS 'Non-farm use type'`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_component" ADD "nfu_sub_type" text`);
        await queryRunner.query(`COMMENT ON COLUMN "alcs"."application_decision_component"."nfu_sub_type" IS 'Non-farm use sub type'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "alcs"."application_decision_component"."nfu_sub_type" IS 'Non-farm use sub type'`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_component" DROP COLUMN "nfu_sub_type"`);
        await queryRunner.query(`COMMENT ON COLUMN "alcs"."application_decision_component"."nfu_type" IS 'Non-farm use type'`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_component" DROP COLUMN "nfu_type"`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_component" ADD "nfu_use_sub_type" text`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision_component" ADD "nfu_use_type" text`);
    }

}
