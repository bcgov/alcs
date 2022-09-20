import { MigrationInterface, QueryRunner } from 'typeorm';

export class cardEntityPart21663356028257 implements MigrationInterface {
  name = 'cardEntityPart21663356028257';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "application" ADD "card_uuid" uuid`);
    await queryRunner.query(
      `ALTER TABLE "application" ADD CONSTRAINT "UQ_21eddf92cb75ff3cc0c99b80d86" UNIQUE ("card_uuid")`,
    );
    await queryRunner.query(`ALTER TABLE "card" ADD "application_uuid" uuid`);
    await queryRunner.query(
      `ALTER TABLE "card" ADD CONSTRAINT "UQ_805372901f7a63eb44495386c8d" UNIQUE ("application_uuid")`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD CONSTRAINT "FK_21eddf92cb75ff3cc0c99b80d86" FOREIGN KEY ("card_uuid") REFERENCES "card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "card" ADD CONSTRAINT "FK_805372901f7a63eb44495386c8d" FOREIGN KEY ("application_uuid") REFERENCES "application"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "card" DROP CONSTRAINT "FK_805372901f7a63eb44495386c8d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP CONSTRAINT "FK_21eddf92cb75ff3cc0c99b80d86"`,
    );
    await queryRunner.query(
      `ALTER TABLE "card" DROP CONSTRAINT "UQ_805372901f7a63eb44495386c8d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "card" DROP COLUMN "application_uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP CONSTRAINT "UQ_21eddf92cb75ff3cc0c99b80d86"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP COLUMN "card_uuid"`,
    );
  }
}
