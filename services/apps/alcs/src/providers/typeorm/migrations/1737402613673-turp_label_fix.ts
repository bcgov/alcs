import { MigrationInterface, QueryRunner } from "typeorm";

export class TurpLabelFix1737402613673 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE alcs.application_decision_component_type SET 
            label = 'Transportation, Utility, or Recreational Trail', 
            description = 'Transportation, Utility, or Recreational Trail' 
            WHERE code = 'TURP';
          `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE alcs.application_decision_component_type SET 
            label = 'Transportation, Utility, and Recreational Trail', 
            description = 'Transportation, Utility, and Recreational Trail' 
            WHERE code = 'TURP';
          `);
    }

}
