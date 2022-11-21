import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedDecisionFields1665686561904 implements MigrationInterface {
  name = 'seedDecisionFields1665686561904';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ceo_criterion" ADD CONSTRAINT "UQ_8e57e2c7ecf54287b65a828717f" UNIQUE ("number")`,
    );

    //Seed ceo criterion
    await queryRunner.query(
      `
      INSERT INTO "ceo_criterion" 
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description", "number") VALUES
        (NULL, '2022-10-13 18:26:59.993928+00', '2022-10-13 18:26:59.993928+00', 'migration_seed', NULL, 'Application consistent with ALC Planning Decision', 'CONS', 'Application consistent with ALC Planning Decision', 1),
        (NULL, '2022-10-13 18:26:59.993928+00', '2022-10-13 18:26:59.993928+00', 'migration_seed', NULL, 'Fulfill requirement of previous ALC Decision', 'FULF', 'Fulfill requirement of previous ALC Decision', 2),
        (NULL, '2022-10-13 18:26:59.993928+00', '2022-10-13 18:26:59.993928+00', 'migration_seed', NULL, 'Minor deviation from permitted uses', 'MIND', 'Minor deviation from permitted uses', 3),
        (NULL, '2022-10-13 18:26:59.993928+00', '2022-10-13 18:26:59.993928+00', 'migration_seed', NULL, 'Linear transportation and utility use (excluding recreational trails)', 'LINT', 'Linear transportation and utility use (excluding recreational trails)', 4),
        (NULL, '2022-10-13 18:26:59.993928+00', '2022-10-13 18:26:59.993928+00', 'migration_seed', NULL, 'Boundary adjustment', 'BOUN', 'Boundary adjustment', 7),
        (NULL, '2022-10-13 18:26:59.993928+00', '2022-10-13 18:26:59.993928+00', 'migration_seed', NULL, 'Condition modification', 'MODI', 'Condition modification', 8),
        (NULL, '2022-10-13 18:26:59.993928+00', '2022-10-13 18:26:59.993928+00', 'migration_seed', NULL, 'Homesite severance', 'HOME', 'Homesite severance', 12),
        (NULL, '2022-10-13 18:26:59.993928+00', '2022-10-13 18:26:59.993928+00', 'migration_seed', NULL, 'Applications that are minor in nature', 'MINO', 'Applications that are minor in nature', 14),
        (NULL, '2022-10-13 18:26:59.993928+00', '2022-10-13 18:26:59.993928+00', 'migration_seed', NULL, 'Temporary farm worker housing', 'TEMP', 'Temporary farm worker housing', 15),
        (NULL, '2022-10-13 18:26:59.993928+00', '2022-10-13 18:26:59.993928+00', 'migration_seed', NULL, 'Place portable classroom or expand playing field of existing school', 'PORT', 'Place portable classroom or expand playing field of existing school', 16),
        (NULL, '2022-10-13 18:26:59.993928+00', '2022-10-13 18:26:59.993928+00', 'migration_seed', NULL, 'Build new residence while occupying existing residence', 'BUIL', 'Build new residence while occupying existing residence', 17),
        (NULL, '2022-10-13 18:26:59.993928+00', '2022-10-13 18:26:59.993928+00', 'migration_seed', NULL, 'Filming in the ALR', 'FILM', 'Filming in the ALR', 18);`,
    );

    //Seed decision maker
    await queryRunner.query(`INSERT INTO "decision_maker"
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "code", "description", "label") VALUES
        (NULL, '2022-10-13 18:26:59.993928+00', NULL, 'migration_seed', NULL, 'EXEC', 'Executive Committee', 'Executive Committee'),
        (NULL, '2022-10-13 18:26:59.993928+00', NULL, 'migration_seed', NULL, 'SOIL', 'Soil & Fill Panel', 'Soil & Fill Panel'),
        (NULL, '2022-10-13 18:26:59.993928+00', NULL, 'migration_seed', NULL, 'CEOP', 'CEO', 'CEO'),
        (NULL, '2022-10-13 18:26:59.993928+00', NULL, 'migration_seed', NULL, 'KOOT', 'Kootenay Panel', 'Kootenay Panel'),
        (NULL, '2022-10-13 18:26:59.993928+00', NULL, 'migration_seed', NULL, 'FILM', 'Film Panel', 'Film Panel'),
        (NULL, '2022-10-13 18:26:59.993928+00', NULL, 'migration_seed', NULL, 'OKAN', 'Okanagan Panel', 'Okanagan Panel'),
        (NULL, '2022-10-13 18:26:59.993928+00', NULL, 'migration_seed', NULL, 'INTE', 'Interior Panel', 'Interior Panel'),
        (NULL, '2022-10-13 18:26:59.993928+00', NULL, 'migration_seed', NULL, 'SOUT', 'South Coast Panel', 'South Coast Panel'),
        (NULL, '2022-10-13 18:26:59.993928+00', NULL, 'migration_seed', NULL, 'ISLE', 'Island Panel', 'Island Panel'),
        (NULL, '2022-10-13 18:26:59.993928+00', NULL, 'migration_seed', NULL, 'NORT', 'North Panel', 'North Panel');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "ceo_criterion"`);
    await queryRunner.query(`DELETE FROM "decision_maker"`);
    await queryRunner.query(
      `ALTER TABLE "ceo_criterion" DROP CONSTRAINT "UQ_8e57e2c7ecf54287b65a828717f"`,
    );
  }
}
