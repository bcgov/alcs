import { MigrationInterface, QueryRunner } from 'typeorm';

export class covenantCardType1667586045825 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        INSERT INTO public.card_type (audit_deleted_date_at,audit_created_at,audit_updated_at,audit_created_by,audit_updated_by,"label",code,description) VALUES
          (NULL,'2022-11-17 11:22:12.366',NULL,'migration_seed',NULL,'Covenant','COV','Card type for Conservation Covenants');
        `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM public.card_type WHERE code = 'COV';`);
  }
}
