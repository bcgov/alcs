import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateDocumentTable1670636483523 implements MigrationInterface {
  name = 'updateDocumentTable1670636483523';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."document" ADD "source" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."document" DROP CONSTRAINT "FK_9b9254f412e8a5a07063209a08c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."document" ALTER COLUMN "uploaded_by_uuid" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."document" DROP CONSTRAINT "FK_9b9254f412e8a5a07063209a08c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."document" ALTER COLUMN "uploaded_by_uuid" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."document" ADD CONSTRAINT "FK_9b9254f412e8a5a07063209a08c" FOREIGN KEY ("uploaded_by_uuid") REFERENCES "alcs"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."document" DROP COLUMN "source"`,
    );
  }
}
