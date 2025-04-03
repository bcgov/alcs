import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeSoilBadges1743115625509 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE alcs.application_type
                                    SET 
                                    short_label = 'ROSO',
                                    background_color = '#674CD4'
                                    WHERE code = 'ROSO';`);
        await queryRunner.query(`UPDATE alcs.application_type
                                    SET 
                                    short_label = 'PFRS',
                                    background_color = '#084299'
                                    WHERE code = 'PFRS';`);
        await queryRunner.query(`UPDATE alcs.application_type
                                    SET 
                                    short_label = 'POFO',
                                    background_color = '#3E7D8E'
                                    WHERE code = 'POFO';`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE alcs.application_type
                                    SET 
                                    short_label = 'SOIL',
                                    background_color = '#084299'
                                    WHERE code = 'ROSO';`);
        await queryRunner.query(`UPDATE alcs.application_type
                                    SET 
                                    short_label = 'SOIL',
                                    background_color = '#084299'
                                    WHERE code = 'PFRS';`);
        await queryRunner.query(`UPDATE alcs.application_type
                                    SET 
                                    short_label = 'SOIL',
                                    background_color = '#084299'
                                    WHERE code = 'POFO';`);
    }

}
