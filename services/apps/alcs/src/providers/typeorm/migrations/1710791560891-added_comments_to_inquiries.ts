import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedCommentsToInquiries1710791560891
  implements MigrationInterface
{
  name = 'AddedCommentsToInquiries1710791560891';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."inquiry_parcel" IS 'Parcels associated with the inquiries'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."inquiry_type" IS 'Code table for possible inquiry types'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "alcs"."inquiry" IS 'Inquiries from the public or other agencies that require a response from the ALC.'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMENT ON TABLE "alcs"."inquiry" IS NULL`);
    await queryRunner.query(`COMMENT ON TABLE "alcs"."inquiry_type" IS NULL`);
    await queryRunner.query(`COMMENT ON TABLE "alcs"."inquiry_parcel" IS NULL`);
  }
}
