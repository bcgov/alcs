import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOatsPropertyIdsToInquiryParcelsCheckExist1713460391976
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = 'alcs.inquiry_parcel';
    const columns = [
      {
        name: 'oats_subject_property_id',
        comment:
          'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_subject_properties to alcs.inquiry_parcel.',
      },
      {
        name: 'oats_property_id',
        comment:
          'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_properties to alcs.inquiry_parcel.',
      },
    ];

    for (const column of columns) {
      const result = await queryRunner.query(
        `SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'alcs' AND TABLE_NAME = 'inquiry_parcel' AND COLUMN_NAME = '${column.name}'`,
      );
      if (!result.length) {
        await queryRunner.query(`ALTER TABLE ${table} ADD ${column.name} text`);
        await queryRunner.query(
          `COMMENT ON COLUMN ${table}.${column.name} IS '${column.comment}'`,
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const columns = ['oats_subject_property_id', 'oats_property_id'];

    for (const column of columns) {
      await queryRunner.query(
        `ALTER TABLE "alcs"."inquiry_parcel" DROP COLUMN "${column}"`,
      );
    }
  }
}
