import { MigrationInterface, QueryRunner } from 'typeorm';

export class firstNationsGovernment1672962786580 implements MigrationInterface {
  name = 'firstNationsGovernment1672962786580';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_local_government" ADD "is_first_nation" boolean NOT NULL DEFAULT false`,
    );

    await queryRunner.query(
      `UPDATE "alcs"."application_local_government" 
       SET "is_first_nation" = true 
       WHERE "name" in ('Nisga''a Nation', 'Tla''amin Nation','Tsawwassen First Nation')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_local_government" DROP COLUMN "is_first_nation"`,
    );
  }
}
