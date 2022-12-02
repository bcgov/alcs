import { MigrationInterface, QueryRunner } from 'typeorm';

export class addClientRoles1662999943554 implements MigrationInterface {
  name = 'addClientRoles1662999943554';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "client_roles" text array NOT NULL DEFAULT '{}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "client_roles"`);
  }
}
