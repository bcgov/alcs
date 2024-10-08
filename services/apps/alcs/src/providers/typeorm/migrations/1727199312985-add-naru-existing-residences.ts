import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNaruExistingResidences1727199312985 implements MigrationInterface {
    name = 'AddNaruExistingResidences1727199312985'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."application_submission" ADD "naru_existing_residences" jsonb NOT NULL DEFAULT '[]'`);
        await queryRunner.query(`COMMENT ON COLUMN "alcs"."application_submission"."naru_existing_residences" IS 'JSONB column containing NARU existing residence'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "alcs"."application_submission"."naru_existing_residences" IS 'JSONB column containing NARU existing residence'`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_submission" DROP COLUMN "naru_existing_residences"`);
    }

}
