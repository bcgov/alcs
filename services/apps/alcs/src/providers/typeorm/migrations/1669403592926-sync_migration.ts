import { MigrationInterface, QueryRunner } from 'typeorm';

export class syncMigration1669154474301 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      INSERT INTO "alcs".migrations ("timestamp","name") VALUES (1669151433055,'renameSchema1669151433055');
      INSERT INTO "alcs"."migrations" ("timestamp","name") VALUES (1669163239822,'updateSchemaInFunctions1669163239822');
      INSERT INTO "alcs".migrations ("timestamp","name") VALUES (1669403592920,'renameCardStatusAndUpdateAppTypeColor1669403592920');
      INSERT INTO "alcs".migrations ("timestamp","name") VALUES (1669154474301,'syncMigration1669154474301');
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // do not need this one
  }
}
