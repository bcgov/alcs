import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedCommentsAndTypesToInquiries1710791560891
  implements MigrationInterface
{
  name = 'AddedCommentsAndTypesToInquiries1710791560891';

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

    await queryRunner.query(
      `
        INSERT INTO alcs.inquiry_type (audit_created_by,"label",code,description,short_label,background_color,text_color,html_description) VALUES
        ('migration_seed','General Correspondence','GENC','Inquiries or correspondence that aren’t property specific or don’t fit other inquiry types','GEN','#0B5656','#FFFFFF','Inquiries or correspondence that aren’t property specific or don’t fit other inquiry types'),
        ('migration_seed','Inquiry for Investigation','INVN','Requests to confirm if a use is permitted or not, generally property specific','INV','#8E7F04','#FFFFFF','Requests to confirm if a use is permitted or not, generally property specific'),
        ('migration_seed','Subdivision by Approving Officer','SAOF','Submission of Subdivision Plans approved by an Approving Officer under Section 3 of the ALR General Regulation.','SAO','#B07213','#FFFFFF','Submission of Subdivision Plans approved by an Approving Officer under Section 3 of the ALR General Regulation.'),
        ('migration_seed','Referral','REFR','A request for ALC comment on a Ministry referral or L/FNG property specific bylaw or other planning document request that is not a Planning Review – often based on an ALC Application approval.','REF','#1D3251','#FFFFFF','A request for ALC comment on a Ministry referral or L/FNG property specific bylaw or other planning document request that is not a Planning Review – often based on an ALC Application approval.'),
        ('migration_seed','Area of Interest','AOIN','TBD AOIN','AOI','#6A080B','#FFFFFF',''),
        ('migration_seed','Parcel Under 2 Acres','P2AC','Requests to confirm if a parcel meets ALCA Section 23(1) exception requirements.','P2A','#752053','#FFFFFF','Requests to confirm if a parcel meets ALCA Section 23(1) exception requirements.'),
        ('migration_seed','ALR Boundary Definition','ABDF','Requests to confirm the legal ALR boundary. E.g. Is the ALR mapping correct or letters confirming ALC interests are unaffected for uses/subdivisions on the non-ALR portion of partial ALR properties.','ABD','#49701E','#FFFFFF','Requests to confirm the legal ALR boundary. E.g. Is the ALR mapping correct or letters confirming ALC interests are unaffected for uses/subdivisions on the non-ALR portion of partial ALR properties.');
      `,
    );

    await queryRunner.query(`
      INSERT INTO alcs.board (uuid,audit_created_by,code,title,show_on_schedule) VALUES
      ('c24234e9-748c-48db-9a0f-88e447473c8e', 'migration_seed','incr','Inquiries',false);
    `);

    await queryRunner.query(`
      INSERT INTO alcs.card_status (audit_created_by,"label",code,description) VALUES
      ('migration_seed','Closed','CLSD','TBD CLSD'),
      ('migration_seed','Drafting Response','DRRE','TBD DRRE'),
      ('migration_seed','Incoming','INCM','TBD INCM'),
      ('migration_seed','Waiting on Inquirer','WAIN','TBD WAIN'),
      ('migration_seed','More Research Needed','MRNE','TBD MRNE'),
      ('migration_seed','Waiting on ALC Review','WARE','TBD WARE'),
      ('migration_seed','ALC Review Complete','ALRC','TBD ALRC');
    `);

    await queryRunner.query(`
      INSERT INTO alcs.board_status (audit_created_by,"order",board_uuid,status_code) VALUES
      ('migration_seed',0,'c24234e9-748c-48db-9a0f-88e447473c8e','INCM'),
      ('migration_seed',1,'c24234e9-748c-48db-9a0f-88e447473c8e','WAIN'),
      ('migration_seed',2,'c24234e9-748c-48db-9a0f-88e447473c8e','MRNE'),
      ('migration_seed',3,'c24234e9-748c-48db-9a0f-88e447473c8e','WARE'),
      ('migration_seed',4,'c24234e9-748c-48db-9a0f-88e447473c8e','ALRC'),
      ('migration_seed',5,'c24234e9-748c-48db-9a0f-88e447473c8e','DRRE'),
      ('migration_seed',6,'c24234e9-748c-48db-9a0f-88e447473c8e','CLSD');
    `);

    await queryRunner.query(`
      INSERT INTO alcs.card_type (audit_created_by,"label",code,description,portal_html_description) VALUES
      ('migration_seed','Inquiry','INQR','Card type for inquiries','');
    `);

    await queryRunner.query(`
      INSERT INTO alcs.board_create_card_types_card_type (board_uuid,card_type_code) VALUES
      ('c24234e9-748c-48db-9a0f-88e447473c8e','INQR');
    `);

    await queryRunner.query(`
      INSERT INTO alcs.board_allowed_card_types_card_type (board_uuid,card_type_code) VALUES
      ('c24234e9-748c-48db-9a0f-88e447473c8e','INQR');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMENT ON TABLE "alcs"."inquiry" IS NULL`);
    await queryRunner.query(`COMMENT ON TABLE "alcs"."inquiry_type" IS NULL`);
    await queryRunner.query(`COMMENT ON TABLE "alcs"."inquiry_parcel" IS NULL`);
  }
}
