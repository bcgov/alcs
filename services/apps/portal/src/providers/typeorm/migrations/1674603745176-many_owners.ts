import { MigrationInterface, QueryRunner } from 'typeorm';

export class manyOwners1674603745176 implements MigrationInterface {
  name = 'manyOwners1674603745176';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "portal"."application_parcel_owners_application_owner" ("application_parcel_uuid" uuid NOT NULL, "application_owner_uuid" uuid NOT NULL, CONSTRAINT "PK_f1917966b23fc0cae577ab0a655" PRIMARY KEY ("application_parcel_uuid", "application_owner_uuid"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_587cc07208988480adbbb7817c" ON "portal"."application_parcel_owners_application_owner" ("application_parcel_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1aed17f119c6a3cb0b8d79a035" ON "portal"."application_parcel_owners_application_owner" ("application_owner_uuid") `,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_parcel_owners_application_owner" ADD CONSTRAINT "FK_587cc07208988480adbbb7817c3" FOREIGN KEY ("application_parcel_uuid") REFERENCES "portal"."application_parcel"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_parcel_owners_application_owner" ADD CONSTRAINT "FK_1aed17f119c6a3cb0b8d79a0350" FOREIGN KEY ("application_owner_uuid") REFERENCES "portal"."application_owner"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application_parcel_owners_application_owner" DROP CONSTRAINT "FK_1aed17f119c6a3cb0b8d79a0350"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_parcel_owners_application_owner" DROP CONSTRAINT "FK_587cc07208988480adbbb7817c3"`,
    );
    await queryRunner.query(
      `DROP INDEX "portal"."IDX_1aed17f119c6a3cb0b8d79a035"`,
    );
    await queryRunner.query(
      `DROP INDEX "portal"."IDX_587cc07208988480adbbb7817c"`,
    );
    await queryRunner.query(
      `DROP TABLE "portal"."application_parcel_owners_application_owner"`,
    );
  }
}
