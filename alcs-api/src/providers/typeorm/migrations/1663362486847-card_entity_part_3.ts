import { MigrationInterface, QueryRunner } from 'typeorm';

export class cardEntityPart31663362486847 implements MigrationInterface {
  name = 'cardEntityPart31663362486847';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "card" DROP CONSTRAINT "FK_805372901f7a63eb44495386c8d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "card" DROP CONSTRAINT "UQ_805372901f7a63eb44495386c8d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "card" DROP COLUMN "application_uuid"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "card" ADD "application_uuid" uuid`);
    await queryRunner.query(
      `ALTER TABLE "card" ADD CONSTRAINT "UQ_805372901f7a63eb44495386c8d" UNIQUE ("application_uuid")`,
    );
    await queryRunner.query(
      `ALTER TABLE "card" ADD CONSTRAINT "FK_805372901f7a63eb44495386c8d" FOREIGN KEY ("application_uuid") REFERENCES "application"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
