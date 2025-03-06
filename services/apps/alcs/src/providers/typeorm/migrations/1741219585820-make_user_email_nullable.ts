import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeUserEmailNullable1741219585820 implements MigrationInterface {
    name = 'MakeUserEmailNullable1741219585820'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."user" ALTER COLUMN "email" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."user" ALTER COLUMN "email" SET NOT NULL`);
    }

}
