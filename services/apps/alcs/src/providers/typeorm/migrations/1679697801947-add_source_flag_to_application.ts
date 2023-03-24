import { MigrationInterface, QueryRunner } from "typeorm";

export class addSourceFlagToApplication1679697801947 implements MigrationInterface {
    name = 'addSourceFlagToApplication1679697801947'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."application" ADD "source" text NOT NULL DEFAULT 'ALCS'`);
        await queryRunner.query(`COMMENT ON COLUMN "alcs"."application"."source" IS 'Determines where the application came from'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "alcs"."application"."source" IS 'Determines where the application came from'`);
        await queryRunner.query(`ALTER TABLE "alcs"."application" DROP COLUMN "source"`);
    }

}
