import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLeadingZeroToPid1707410497801 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE alcs.application_parcel
      SET pid = LPAD(PID, 9, '0')
      WHERE pid IS NOT NULL AND pid != '' AND LENGTH(PID) < 9;`,
    );

    await queryRunner.query(
      `UPDATE alcs.notice_of_intent_parcel
        SET pid = LPAD(PID, 9, '0')
        WHERE pid IS NOT NULL AND pid != '' AND LENGTH(PID) < 9;`,
    );

    await queryRunner.query(
      `UPDATE alcs.notification_parcel
          SET pid = LPAD(PID, 9, '0')
          WHERE pid IS NOT NULL AND pid != '' AND LENGTH(PID) < 9;`,
    );
  }

  public async down(): Promise<void> {
    // nope
  }
}
