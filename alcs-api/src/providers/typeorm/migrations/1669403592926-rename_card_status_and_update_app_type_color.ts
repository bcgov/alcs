import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameCardStatusAndUpdateAppTypeColor1669403592926
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      ` 
      UPDATE "card_status"
      SET "label" = 'App Prelim Done / To Be Assigned to LUP'
      WHERE "code"='PREL';
      `,
    );
    await queryRunner.query(
      ` 
      UPDATE "application_type"
      SET "background_color" = '#ffadbf'
      WHERE "code"='INCL';
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      ` 
        UPDATE "public"."card_status"
        SET "label" = 'App Prelim Done/To Be Assigned to LUP'
        WHERE "code"='PREL';
        `,
    );
    await queryRunner.query(
      ` 
      UPDATE "application_type"
      SET "background_color" = '#ff859f'
      WHERE "code"='INCL';
      `,
    );
  }
}
