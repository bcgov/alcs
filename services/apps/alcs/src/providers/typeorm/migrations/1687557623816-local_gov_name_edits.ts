import { MigrationInterface, QueryRunner } from "typeorm"

export class localGovNameEdits1687557623816 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          UPDATE "alcs"."application_local_government" SET "name" = 'Village of Masset' WHERE "name" = 'Village of Massett';
          DELETE FROM alcs.application_local_government WHERE name = 'Northern Rockies Regional Municipality';

        `);
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
