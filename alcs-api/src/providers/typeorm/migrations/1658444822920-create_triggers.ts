import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTriggers1658444822920 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TRIGGER after_update_set_audit_updated_at_timestamp
        BEFORE UPDATE ON application
        FOR EACH ROW
        EXECUTE PROCEDURE trigger_set_timestamp();`);

    await queryRunner.query(`CREATE TRIGGER after_update_set_audit_updated_at_timestamp
        BEFORE UPDATE ON application_status
        FOR EACH ROW
        EXECUTE PROCEDURE trigger_set_timestamp();`);

    await queryRunner.query(`CREATE TRIGGER after_update_set_audit_updated_at_timestamp
        BEFORE UPDATE ON "user"
        FOR EACH ROW
        EXECUTE PROCEDURE trigger_set_timestamp();`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS after_update_set_audit_updated_at_timestamp ON application;`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS after_update_set_audit_updated_at_timestamp ON application_status;`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS after_update_set_audit_updated_at_timestamp ON "user";`,
    );
  }
}
