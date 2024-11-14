import { MigrationInterface, QueryRunner } from "typeorm";

export class DocCodeRename1728585388487 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `UPDATE "alcs"."document_code" SET 
                "label" = 'Other File Info'
             WHERE "code" = 'OTHR';`,
          );
          await queryRunner.query(
            `UPDATE "alcs"."document_code" SET 
                "label" = 'C&E Letter'
            WHERE "code" = 'CAEL';`,
          );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `UPDATE "alcs"."document_code" SET 
                "label" = 'Other Correspondence or File Information'
            WHERE "code" = 'OTHR';`,
          );
        await queryRunner.query(
            `UPDATE "alcs"."document_code" SET 
                "label" = 'Compliance and Enforcement Letter'
            WHERE "code" = 'CAEL';`,
          );
        
    }

}
