import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameReceivedDate1668471131075 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(
      `ALTER TABLE application RENAME COLUMN "date_received" TO "date_submitted_to_alc"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(
      `ALTER TABLE application RENAME COLUMN "date_submitted_to_alc" TO "date_received"`,
    );
  }
}
