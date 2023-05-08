import { MigrationInterface, QueryRunner } from 'typeorm';

export class applicationDecisionComponent1683587420626
  implements MigrationInterface
{
  name = 'applicationDecisionComponent1683587420626';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `create table "alcs"."application_decision_component_type" ("audit_deleted_date_at" TIMESTAMP with TIME zone,
      "audit_created_at" TIMESTAMP with TIME zone not null default now(),
      "audit_updated_at" TIMESTAMP with TIME zone default now(),
      "audit_created_by" character varying not null,
      "audit_updated_by" character varying,
      "label" character varying not null,
      "code" text not null,
      "description" text not null,
      constraint "UQ_289a566e5c97ce588f1066fe5f2" unique ("description"),
      constraint "PK_5ec3d66d44553300baad9eea612" primary key ("code"))`,
    );
    await queryRunner.query(
      `create table "alcs"."application_decision_component" ("audit_deleted_date_at" TIMESTAMP with TIME zone,
      "audit_created_at" TIMESTAMP with TIME zone not null default now(),
      "audit_updated_at" TIMESTAMP with TIME zone default now(),
      "audit_created_by" character varying not null,
      "audit_updated_by" character varying,
      "uuid" uuid not null default gen_random_uuid(),
      "alr_area" numeric(12,
      2),
      "ag_cap" text,
      "ag_cap_source" text,
      "ag_cap_map" text,
      "ag_cap_consultant" text,
      "nfu_use_type" text,
      "nfu_use_sub_type" text,
      "nfu_end_date" TIMESTAMP with TIME zone,
      "application_decision_component_type_code" text,
      "application_decision_uuid" uuid,
      constraint "PK_f001f61f948fb923add00b6dab6" primary key ("uuid"));
      
      comment on
      column "alcs"."application_decision_component"."alr_area" is 'Area in hectares of ALR impacted by the decision component';
      
      comment on
      column "alcs"."application_decision_component"."ag_cap" is 'Agricultural cap classification';
      
      comment on
      column "alcs"."application_decision_component"."ag_cap_source" is 'Agricultural capability classification system used';
      
      comment on
      column "alcs"."application_decision_component"."ag_cap_map" is 'Agricultural capability map sheet reference';
      
      comment on
      column "alcs"."application_decision_component"."ag_cap_consultant" is 'Consultant who determined the agricultural capability';
      
      comment on
      column "alcs"."application_decision_component"."nfu_use_type" is 'Non-farm use type';
      
      comment on
      column "alcs"."application_decision_component"."nfu_use_sub_type" is 'Non-farm use sub type';
      
      comment on
      column "alcs"."application_decision_component"."nfu_end_date" is 'The date at which the non-farm use ends'`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ADD CONSTRAINT "FK_3b336a2df3a3ab65bbbd91008e7" FOREIGN KEY ("application_decision_component_type_code") REFERENCES "alcs"."application_decision_component_type"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" ADD CONSTRAINT "FK_0eff4e8760453f611498a394595" FOREIGN KEY ("application_decision_uuid") REFERENCES "alcs"."application_decision"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" DROP CONSTRAINT "FK_0eff4e8760453f611498a394595"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alcs"."application_decision_component" DROP CONSTRAINT "FK_3b336a2df3a3ab65bbbd91008e7"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."application_decision_component"`,
    );
    await queryRunner.query(
      `DROP TABLE "alcs"."application_decision_component_type"`,
    );
  }
}
