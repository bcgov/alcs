import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveCrownlandtypeFromSubmission1702658459584 implements MigrationInterface {
    name = 'RemoveCrownlandtypeFromSubmission1702658459584'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."application_submission" DROP COLUMN "crown_land_owner_type"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_submission" DROP COLUMN "crown_land_owner_type"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_submission" ADD "crown_land_owner_type" character varying`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_submission" ADD "crown_land_owner_type" character varying`);
    }

}
