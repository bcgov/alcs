import { MigrationInterface, QueryRunner } from 'typeorm';

export class reconsideratioAndDecisionCodes1669420668991
  implements MigrationInterface
{
  name = 'reconsideratioAndDecisionCodes1669420668991';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_decision_chair_review_outcome_type" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_e5eef93f2745a8142a23eab697c" UNIQUE ("description"), CONSTRAINT "PK_a6c8477e05aafb8345002bb397f" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alcs"."application_reconsideration_outcome_type" ("audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_eaad3466afc023a3e9da9360e1a" UNIQUE ("description"), CONSTRAINT "PK_5c6b9f7e0b9e856b4974b538846" PRIMARY KEY ("code"))`,
    );

    await queryRunner.query(`
        INSERT INTO alcs.application_reconsideration_outcome_type (audit_deleted_date_at,audit_created_at,audit_updated_at,audit_created_by,audit_updated_by,"label",code,description) VALUES
        (NULL,'2022-09-27 03:45:22.490',NULL,'migration_seed',NULL,'Pending','PEN','Pending'),
        (NULL,'2022-09-27 03:45:22.490',NULL,'migration_seed',NULL,'Proceed','PRC','Proceed'),
        (NULL,'2022-09-27 03:45:22.490',NULL,'migration_seed',NULL,'Refuse','REF','Refuse');
    `);

    await queryRunner.query(`
        INSERT INTO alcs.application_decision_chair_review_outcome_type (audit_deleted_date_at,audit_created_at,audit_updated_at,audit_created_by,audit_updated_by,"label",code,description) VALUES
        (NULL,'2022-09-27 03:45:22.490',NULL,'migration_seed',NULL,'Reconsider','REC','Reconsider'),
        (NULL,'2022-09-27 03:45:22.490',NULL,'migration_seed',NULL,'Stay','STAY','Stay');
    `);

    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD "chair_review_outcome_code" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsideration" ADD "review_outcome_code" text NOT NULL DEFAULT 'PEN'`,
    );

    await queryRunner.query(`
        UPDATE "alcs"."application_reconsideration"
        SET "review_outcome_code" = CASE WHEN "is_review_approved" is NULL THEN 'PEN'
                                         WHEN "is_review_approved" is TRUE THEN 'PRC'
                                         ELSE 'REF'
                                    END;
    `);

    await queryRunner.query(`
    UPDATE "alcs"."application_decision"
    SET "chair_review_outcome_code" = CASE WHEN "chair_review_outcome" is NULL THEN NULL
                                           WHEN "chair_review_outcome" is TRUE THEN 'STAY'
                                           ELSE 'REC'
                                      END;
    `);

    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" ADD CONSTRAINT "FK_e88e4a5dc4db0a7ba934b99dbe0" FOREIGN KEY ("chair_review_outcome_code") REFERENCES "alcs"."application_decision_chair_review_outcome_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsideration" ADD CONSTRAINT "FK_bcb7f86e9e22f3632cf52135540" FOREIGN KEY ("review_outcome_code") REFERENCES "alcs"."application_reconsideration_outcome_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(`
        ALTER TABLE "alcs"."application_decision" DROP COLUMN chair_review_outcome;
        ALTER TABLE "alcs"."application_reconsideration" DROP COLUMN is_review_approved;
    `);

    await queryRunner.query(`
        ALTER TABLE "alcs"."application_reconsideration" ALTER COLUMN review_outcome_code DROP DEFAULT;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsideration" DROP CONSTRAINT "FK_bcb7f86e9e22f3632cf52135540"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP CONSTRAINT "FK_e88e4a5dc4db0a7ba934b99dbe0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_reconsideration" DROP COLUMN "review_outcome_code"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision" DROP COLUMN "chair_review_outcome_code"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."application_reconsideration_outcome_type"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."application_decision_chair_review_outcome_type"`,
    );
  }
}
