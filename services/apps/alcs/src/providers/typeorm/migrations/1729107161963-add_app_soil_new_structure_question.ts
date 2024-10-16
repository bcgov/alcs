import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAppSoilNewStructureQuestion1729107161963 implements MigrationInterface {
    name = 'AddAppSoilNewStructureQuestion1729107161963'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."application_submission" ADD "soil_is_new_structure" boolean`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."application_submission" DROP COLUMN "soil_is_new_structure"`);
    }

}
