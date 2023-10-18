import { MigrationInterface, QueryRunner } from "typeorm"

export class noiLegacyId1697656555589 implements MigrationInterface {
    name = 'noiLegacyId1697656555589';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "alcs"."notice_of_intent" ADD "legacy_id" text`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "alcs"."notice_of_intent"."legacy_id" IS 'Notice of Intent Id that is applicable only to paper version applications from 70s - 80s'`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `COMMENT ON COLUMN "alcs"."notice_of_intent"."legacy_id" IS 'Notice of Intent Id that is applicable only to paper version applications from 70s - 80s'`,
        );
        await queryRunner.query(
            `ALTER TABLE "alcs"."notice_of_intent" DROP COLUMN "legacy_id"`,
        );
    }

}
