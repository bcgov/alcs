import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNaruProposedResidences1727382304979 implements MigrationInterface {
    name = 'AddNaruProposedResidences1727382304979'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."application_submission" ADD "naru_proposed_residences" jsonb NOT NULL DEFAULT '[]'`);
        await queryRunner.query(`COMMENT ON COLUMN "alcs"."application_submission"."naru_proposed_residences" IS 'JSONB column containing NARU proposed residences'`);
        await queryRunner.query(`COMMENT ON COLUMN "alcs"."application_submission"."naru_existing_residences" IS 'JSONB column containing NARU existing residences'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "alcs"."application_submission"."naru_existing_residences" IS 'JSONB column containing NARU existing residence'`);
        await queryRunner.query(`COMMENT ON COLUMN "alcs"."application_submission"."naru_proposed_residences" IS 'JSONB column containing NARU proposed residences'`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_submission" DROP COLUMN "naru_proposed_residences"`);
    }

}
