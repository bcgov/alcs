import { MigrationInterface, QueryRunner } from "typeorm"

export class renameNfuPlacement1693945647800 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
          `ALTER TABLE "alcs"."application_submission" RENAME COLUMN "nfu_total_fill_placement" TO "nfu_total_fill_area"`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "alcs"."application_submission"."nfu_total_fill_area" IS 'Area for nfu placement of fill'`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `COMMENT ON COLUMN "alcs"."application_submission"."nfu_total_fill_area" IS 'Area for nfu placement of fill'`,
        );
        await queryRunner.query(
            `ALTER TABLE "alcs"."application_submission" DROP COLUMN "nfu_total_fill_area"`,
          );
    }

}
