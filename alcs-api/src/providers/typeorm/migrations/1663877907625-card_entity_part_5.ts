import { MigrationInterface, QueryRunner } from 'typeorm';

export class cardEntityPart51663877907625 implements MigrationInterface {
  name = 'cardEntityPart51663877907625';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_subtask_type" RENAME TO card_subtask_type;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
