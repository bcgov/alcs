import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameCardStatus1668468834615 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      ` 
      UPDATE "card_status"
      SET "label" = 'Ready&nbsp;for&nbsp;Review&nbsp;Sent / Going&nbsp;to&nbsp;Next&nbsp;Review&nbsp;Discussion'
      WHERE "code"='READ';
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      ` 
        UPDATE "public"."card_status"
        SET "label" = 'Ready&nbsp;for&nbsp;Review&nbsp;Sent / Going&nbsp;to&nbsp;Next&nbsp;Review&nbsp;Meeting'
        WHERE "code"='READ';
        `,
    );
  }
}
