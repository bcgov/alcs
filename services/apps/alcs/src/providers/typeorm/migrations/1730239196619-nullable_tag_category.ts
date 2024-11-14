import { MigrationInterface, QueryRunner } from "typeorm";

export class NullableTagCategory1730239196619 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."tag" ALTER COLUMN "category_uuid" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // N/A
    }

}
