import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedNoiSubtypes1685481055836 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "alcs"."notice_of_intent_subtype"
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
        (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Alcohol Production', 'ALCP', 'Alcohol Production'),
        (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Compost or Soil Blending', 'COSB', 'Compost or Soil Blending'),
        (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Equestrian Facility', 'EQUF', 'Equestrian Facility'),
        (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Farm Building - Intensive Livestock', 'FBIL', 'Farm Building - Intensive Livestock'),
        (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Farm Building - Cannabis', 'FBCA', 'Farm Building - Cannabis'),
        (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Farm Building - Greenhouse', 'FBGH', 'Farm Building - Greenhouse'),
        (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Farm Building - Other', 'FBOT', 'Farm Building - Other'),
        (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Farm Processing', 'FPRO', 'Farm Processing'),
        (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Farm Retail Sales', 'FRET', 'Farm Retail Sales'),
        (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Farm Road', 'FROA', 'Farm Road'),
        (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Gravel Extraction', 'GREX', 'Gravel Extraction'),
        (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Kennel', 'KENN', 'Kennel'),
        (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Land Development - Farm Use', 'LDFU', 'Land Development - Farm Use'),
        (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Land Development - Non Farm', 'LDNF', 'Land Development - Non Farm'),
        (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Residential - Accessory Structures', 'RACS', 'Residential - Accessory Structures'),
        (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Residential - Additional', 'RADD', 'Residential - Additional'),
        (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Residential - Driveway', 'RDRI', 'Residential - Driveway'),
        (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Residential - Principal', 'RPRI', 'Residential - Principal'),
        (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Soil Removal', 'ROSO', 'Soil Removal'),
        (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Telecommunications Towers', 'TELT', 'Telecommunications Towers'),
        (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Others', 'OTHE', 'Others'),
        (DEFAULT, NOW(), DEFAULT, 'migration_seed', DEFAULT, 'Pool', 'POOL', 'Pool');
    `);
  }

  public async down(): Promise<void> {
    //No
  }
}
