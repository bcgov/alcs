import { MigrationInterface, QueryRunner } from 'typeorm';

export class addReconsiderationTypeCard1664212136919
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      ` 
      INSERT INTO public.card_type (uuid,audit_deleted_date_at,audit_created_at,audit_updated_at,audit_created_by,audit_updated_by,"label",code,description) VALUES
	    ('2d7a9c6d-06e5-48e7-9002-d609aa575aff',NULL,'2022-09-27 09:44:19.704',NULL,'migration_seed',NULL,'Reconsideration','RECON','Reconsideration type card');
      `,
    );

    await queryRunner.query(
      `CREATE TABLE "reconsideration_type" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "audit_deleted_date_at" TIMESTAMP WITH TIME ZONE, "audit_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "audit_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "audit_created_by" character varying NOT NULL, "audit_updated_by" character varying, "label" character varying NOT NULL, "code" text NOT NULL, "description" text NOT NULL, CONSTRAINT "UQ_d141dda7d1d0d9b59629557827e" UNIQUE ("code"), CONSTRAINT "UQ_cf38509e56ffe4793053f949553" UNIQUE ("description"), CONSTRAINT "PK_2ffcd94d8574e04dc112b07cee7" PRIMARY KEY ("uuid"))`,
    );

    await queryRunner.query(
      `INSERT INTO public.reconsideration_type
      (uuid, audit_deleted_date_at, audit_created_at, audit_updated_at, audit_created_by, audit_updated_by, "label", code, description) VALUES
      ('2edd7918-75d2-4de4-8061-72885a610cf5'::uuid, NULL, '2022-09-27 10:45:22.490', NULL, 'migration_seed', NULL, '33', '33', '33'),
      ('b31a261a-a1b5-4760-bcf0-73be8d04e8e3'::uuid, NULL, '2022-09-27 10:45:22.490', NULL, 'migration_seed', NULL, '33.1', '33.1', '33.1');`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
