import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedApplicationTypes1659047420726 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO "public"."application_type" 
      ("uuid", "audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "code", "description", "label", "short_label", "background_color", "text_color") VALUES
      ('1a8d99d2-1601-4af2-afb1-f5429b32be5a', NULL, now(), NULL, 'alcs-api', NULL, 'POFO', 'Placement of Fill Only', 'Placement of Fill', 'SOIL', '#b2ff59', '#000'),
      ('71dfa994-5667-49a6-9be4-1822b45ac7a3', NULL, now(), NULL, 'alcs-api', NULL, 'ROSO', 'Removal of Soil Only', 'Removal of Soil', 'SOIL', '#b2ff59', '#000'),
      ('7f99b32b-d1ea-4147-bf9c-4a81fbbac6cb', NULL, now(), NULL, 'alcs-api', NULL, 'PFRS', 'Placement of Fill and Removal of Soil', 'Placement of Fill/Removal of Soil', 'SOIL', '#b2ff59', '#000'),
      ('8a21179e-6fa0-4584-b4f1-d72c3f758b0a', NULL, now(), NULL, 'alcs-api', NULL, 'INCL', 'Inclusion Permit', 'Inclusion', 'INC', '#ff859f', '#000'),
      ('9f444184-09be-4a6e-8095-c702cc4681c7', NULL, now(), NULL, 'alcs-api', NULL, 'SUBD', 'Subdivision Permit', 'Subdivison', 'SD', '#c12bdb', '#fff'),
      ('dc07b1e7-2f58-43ab-817f-7ef83d9d35b0', NULL, now(), NULL, 'alcs-api', NULL, 'EXCL', 'Exclusion Permit', 'Exclusion', 'EXC', '#45f4f4', '#000'),
      ('e272645d-dcd2-405b-8caf-f94a17500f14', NULL, now(), NULL, 'alcs-api', NULL, 'TURP', 'Transportation, Utility, Trail Permits', 'Transportation, Utility, or Recreational Trail', 'TUR', '#0a1e8d', '#fff'),
      ('ee666f9f-4d94-44dd-b081-535c7aeb50c8', NULL, now(), NULL, 'alcs-api', NULL, 'NFUP', 'Non-Farm Use Permit', 'Non-Farm Use', 'NFU', '#228820', '#fff'),
      ('f985b157-cc10-4475-8504-06279a2cd73d', NULL, now(), NULL, 'alcs-api', NULL, 'NARU', 'Non-Adhering Residential Use', 'Non-Adhering Residential Use', 'NARU', '#454545', '#fff');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`delete from public.holiday_entity`);
  }
}
