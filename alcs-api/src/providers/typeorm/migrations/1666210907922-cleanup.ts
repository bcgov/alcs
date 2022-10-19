import { MigrationInterface, QueryRunner } from 'typeorm';

export class cleanup1666210907922 implements MigrationInterface {
  name = 'cleanup1666210907922';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "planning_review" DROP CONSTRAINT "FK_03a05aa8fefbc2fc1cdf138d807"`,
    );
    await queryRunner.query(
      `ALTER TABLE "planning_review" DROP CONSTRAINT "FK_aa000ca980238643bb70df5270b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_status" DROP CONSTRAINT "FK_30cd0aba1ecf48c3687eaa215e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_status" DROP CONSTRAINT "UQ_cf22f0a664bdb4efafd1bce647d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_status" ALTER COLUMN "board_uuid" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP CONSTRAINT "FK_d00682751a3d4cdd7c9a16ab041"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ALTER COLUMN "outcome_code" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_status" ADD CONSTRAINT "UQ_cf22f0a664bdb4efafd1bce647d" UNIQUE ("board_uuid", "status_code")`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_status" ADD CONSTRAINT "FK_30cd0aba1ecf48c3687eaa215e1" FOREIGN KEY ("board_uuid") REFERENCES "board"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" ADD CONSTRAINT "FK_c6031d3312bd42fd3f325eba266" FOREIGN KEY ("meeting_pause_uuid") REFERENCES "application_paused"("uuid") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "planning_review" ADD CONSTRAINT "FK_735dcdd4fa909a60d0fa1828f24" FOREIGN KEY ("card_uuid") REFERENCES "card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "planning_review" ADD CONSTRAINT "FK_5a57c8d407eb6132ed39cb8fe6f" FOREIGN KEY ("local_government_uuid") REFERENCES "application_local_government"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD CONSTRAINT "FK_d00682751a3d4cdd7c9a16ab041" FOREIGN KEY ("outcome_code") REFERENCES "decision_outcome_code"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_decision" DROP CONSTRAINT "FK_d00682751a3d4cdd7c9a16ab041"`,
    );
    await queryRunner.query(
      `ALTER TABLE "planning_review" DROP CONSTRAINT "FK_5a57c8d407eb6132ed39cb8fe6f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "planning_review" DROP CONSTRAINT "FK_735dcdd4fa909a60d0fa1828f24"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_meeting" DROP CONSTRAINT "FK_c6031d3312bd42fd3f325eba266"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_status" DROP CONSTRAINT "FK_30cd0aba1ecf48c3687eaa215e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_status" DROP CONSTRAINT "UQ_cf22f0a664bdb4efafd1bce647d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ALTER COLUMN "outcome_code" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "application_decision" ADD CONSTRAINT "FK_d00682751a3d4cdd7c9a16ab041" FOREIGN KEY ("outcome_code") REFERENCES "decision_outcome_code"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_status" ALTER COLUMN "board_uuid" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_status" ADD CONSTRAINT "UQ_cf22f0a664bdb4efafd1bce647d" UNIQUE ("board_uuid", "status_code")`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_status" ADD CONSTRAINT "FK_30cd0aba1ecf48c3687eaa215e1" FOREIGN KEY ("board_uuid") REFERENCES "board"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "planning_review" ADD CONSTRAINT "FK_aa000ca980238643bb70df5270b" FOREIGN KEY ("local_government_uuid") REFERENCES "application_local_government"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "planning_review" ADD CONSTRAINT "FK_03a05aa8fefbc2fc1cdf138d807" FOREIGN KEY ("card_uuid") REFERENCES "card"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
