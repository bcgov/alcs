import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertNaruFloorAreaAndExistingStructuers1728581017573
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE alcs.application_submission as2
            SET naru_existing_residences = jsonb_build_array(
                jsonb_build_object(
                    'floorArea', 0,
                    'description', as2.naru_existing_structures
                )
            ) 
            WHERE as2.naru_existing_structures IS NOT NULL;
        `);

    await queryRunner.query(`
            UPDATE alcs.application_submission as2
            SET naru_proposed_residences = jsonb_build_array(
                jsonb_build_object(
                    'floorArea', (as2.naru_floor_area::float) ,
                    'description', ''
                )
            ) 
            WHERE as2.naru_floor_area IS NOT NULL;   
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE alcs.application_submission as2
            SET naru_existing_residences = '[]'::jsonb
            WHERE as2.naru_existing_structures IS NOT NULL;
        `);

    await queryRunner.query(`        
            UPDATE alcs.application_submission as2
            SET naru_proposed_residences = '[]'::jsonb
            WHERE as2.naru_floor_area IS NOT NULL;
        `);
  }
}
