import { MigrationInterface, QueryRunner } from 'typeorm';

export class setupVetted1661377209201 implements MigrationInterface {
  name = 'setupVetted1661377209201';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO "public"."application_status"
      ("uuid", "audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
      ('264ca7f4-30e3-4566-af1d-f2f3c3d6e8ba', NULL, '2022-08-15 19:10:03.397542+00', '2022-08-24 21:44:02.490667+00', 'migration_seed', NULL, 'Acknowledged Complete', 'ACKC', 'App is complete and ready for LUPs'),
      ('797995b8-3784-404c-af56-e7385f2c8901', NULL, '2022-08-15 19:10:03.397542+00', '2022-08-24 21:44:02.490667+00', 'migration_seed', NULL, 'Acknowledged Incomplete', 'ACKI', 'App is incomplete and requires fixes by Applicant'),
      ('e287ac2d-6296-4f8e-a706-14e67c440fcb', NULL, '2022-08-15 19:10:03.397542+00', '2022-08-24 21:44:02.490667+00', 'migration_seed', NULL, 'To Be Vetted', 'VETT', 'To be Vetted by App Specialist'),
      ('f9f4244f-9741-45f0-9724-ce13e8aa09eb', NULL, '2022-08-15 19:10:03.397542+00', '2022-08-24 21:44:02.490667+00', 'migration_seed', NULL, 'Submitted to ALC', 'SUBM', 'Submitted from ALC Portal');
    `);

    await queryRunner.query(`INSERT INTO "public"."board_status"
      ("uuid", "audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "order", "board_uuid", "status_uuid") VALUES
      (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 0, 'bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2', 'f9f4244f-9741-45f0-9724-ce13e8aa09eb'),
      (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 1, 'bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2', 'e287ac2d-6296-4f8e-a706-14e67c440fcb'),
      (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 2, 'bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2', '797995b8-3784-404c-af56-e7385f2c8901'),
      (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 3, 'bb70eb85-6250-49b9-9a5c-e3c2e0b9f3a2', '264ca7f4-30e3-4566-af1d-f2f3c3d6e8ba');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
