import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUniqueConstraints1730856145155 implements MigrationInterface {
    name = 'RemoveUniqueConstraints1730856145155'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."tag_category" DROP CONSTRAINT "UQ_f48a9fe1f705a7c2a60856d395a"`);
        await queryRunner.query(`ALTER TABLE "alcs"."tag" DROP CONSTRAINT "UQ_6a9775008add570dc3e5a0bab7b"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."tag" ADD CONSTRAINT "UQ_6a9775008add570dc3e5a0bab7b" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "alcs"."tag_category" ADD CONSTRAINT "UQ_f48a9fe1f705a7c2a60856d395a" UNIQUE ("name")`);
    }

}
