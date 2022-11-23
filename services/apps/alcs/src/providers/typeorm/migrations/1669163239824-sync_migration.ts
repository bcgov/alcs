import { MigrationInterface, QueryRunner } from 'typeorm';

export class syncMigration1669154474301 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "alcs"."migrations" ("timestamp","name") VALUES (1669151433055,'renameSchema1669151433055');`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
