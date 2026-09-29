import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsCrownPartiesToCAndESearchView1786576498852 implements MigrationInterface {
  name = 'AddIsCrownPartiesToCAndESearchView1786576498852';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "alcs"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'compliance_and_enforcement_search_view', 'alcs'],
    );
    await queryRunner.query(`DROP VIEW "alcs"."compliance_and_enforcement_search_view"`);
    await queryRunner.query(
      `CREATE VIEW "alcs"."compliance_and_enforcement_search_view" AS
        SELECT
          "cae"."uuid" AS "uuid",
          "lg"."name" AS "local_government_name",
          "cae"."file_number" AS "file_number",
          "cae"."date_submitted" AS "date_submitted",
          "caep"."civic_address" AS "civic_address",
          case
            when caep.ownership_type_code = 'CRWN' then true
            else false
          end AS "is_crown",
          array_agg(
            coalesce(
              nullif("caerp"."individual_name", ''),
              nullif("caerp"."organization_name", '')
            )
          )
            filter (where "caerp"."uuid" is not null) AS "responsible_parties",
          case
            when "cae"."date_opened" is not null and "cae"."date_closed" is null then true
            when "cae"."date_opened" is not null and "cae"."date_closed" is not null then false
            else null
          end AS "is_open"
        FROM
          "alcs"."compliance_and_enforcement" "cae"
          LEFT JOIN "alcs"."compliance_and_enforcement_property" "caep" ON "caep"."file_uuid" = "cae"."uuid"
          LEFT JOIN "alcs"."compliance_and_enforcement_responsible_party" "caerp" ON "caerp"."file_uuid" = "cae"."uuid"
          LEFT JOIN "alcs"."compliance_and_enforcement_responsible_party_director" "caerpd" ON "caerpd"."responsible_party_uuid" = "caerp"."uuid"
          LEFT JOIN "alcs"."local_government" "lg" ON "lg"."uuid" = "caep"."local_government_uuid" AND "lg"."audit_deleted_date_at" IS NULL
        WHERE
          "cae"."audit_deleted_date_at" IS NULL
        GROUP BY
          cae."uuid",
          caep.civic_address,
          caep.ownership_type_code,
          lg."name"`,
    );
    await queryRunner.query(
      `INSERT INTO "alcs"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'alcs',
        'VIEW',
        'compliance_and_enforcement_search_view',
        'SELECT "cae"."uuid" AS "uuid", "lg"."name" AS "local_government_name", "cae"."file_number" AS "file_number", "cae"."date_submitted" AS "date_submitted", "caep"."civic_address" AS "civic_address", case\n          when caep.ownership_type_code = \'CRWN\' then true\n          else false\n        end AS "is_crown", array_agg(\n          coalesce(\n            nullif("caerp"."individual_name", \'\'),\n            nullif("caerp"."organization_name", \'\')\n          )\n        )\n          filter (where "caerp"."uuid" is not null) AS "responsible_parties", case\n          when "cae"."date_opened" is not null and "cae"."date_closed" is null then true\n          when "cae"."date_opened" is not null and "cae"."date_closed" is not null then false\n          else null\n        end AS "is_open" FROM "alcs"."compliance_and_enforcement" "cae" LEFT JOIN "alcs"."compliance_and_enforcement_property" "caep" ON "caep"."file_uuid" = "cae"."uuid"  LEFT JOIN "alcs"."compliance_and_enforcement_responsible_party" "caerp" ON "caerp"."file_uuid" = "cae"."uuid"  LEFT JOIN "alcs"."compliance_and_enforcement_responsible_party_director" "caerpd" ON "caerpd"."responsible_party_uuid" = "caep"."uuid"  LEFT JOIN "alcs"."local_government" "lg" ON  "lg"."uuid" = "caep"."local_government_uuid" AND "lg"."audit_deleted_date_at" IS NULL WHERE "cae"."audit_deleted_date_at" IS NULL',
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "alcs"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'compliance_and_enforcement_search_view', 'alcs'],
    );
    await queryRunner.query(`DROP VIEW "alcs"."compliance_and_enforcement_search_view"`);
    await queryRunner.query(`CREATE VIEW "alcs"."compliance_and_enforcement_search_view" AS SELECT "cae"."uuid" AS "uuid", "cae"."file_number" AS "file_number", "cae"."date_submitted" AS "date_submitted", "caep"."civic_address" AS "civic_address", 'party list' AS "responsible_parties", case
          when "cae"."date_opened" is not null and "cae"."date_closed" is null then true
          when "cae"."date_opened" is not null and "cae"."date_closed" is not null then false
          else null
        end AS "is_open", lg.name AS "local_government_name" FROM "alcs"."compliance_and_enforcement" "cae" LEFT JOIN "alcs"."compliance_and_enforcement_property" "caep" ON "caep"."file_uuid" = "cae"."uuid"  LEFT JOIN "alcs"."compliance_and_enforcement_responsible_party" "caerp" ON "caerp"."file_uuid" = "cae"."uuid"  LEFT JOIN "alcs"."compliance_and_enforcement_responsible_party_director" "caerpd" ON "caerpd"."responsible_party_uuid" = "caep"."uuid"  LEFT JOIN "alcs"."local_government" "lg" ON  "lg"."uuid" = "caep"."local_government_uuid" AND "lg"."audit_deleted_date_at" IS NULL WHERE "cae"."audit_deleted_date_at" IS NULL`);
    await queryRunner.query(
      `INSERT INTO "alcs"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'alcs',
        'VIEW',
        'compliance_and_enforcement_search_view',
        'SELECT "cae"."uuid" AS "uuid", "cae"."file_number" AS "file_number", "cae"."date_submitted" AS "date_submitted", "caep"."civic_address" AS "civic_address", \'party list\' AS "responsible_parties", case\n          when "cae"."date_opened" is not null and "cae"."date_closed" is null then true\n          when "cae"."date_opened" is not null and "cae"."date_closed" is not null then false\n          else null\n        end AS "is_open", lg.name AS "local_government_name" FROM "alcs"."compliance_and_enforcement" "cae" LEFT JOIN "alcs"."compliance_and_enforcement_property" "caep" ON "caep"."file_uuid" = "cae"."uuid"  LEFT JOIN "alcs"."compliance_and_enforcement_responsible_party" "caerp" ON "caerp"."file_uuid" = "cae"."uuid"  LEFT JOIN "alcs"."compliance_and_enforcement_responsible_party_director" "caerpd" ON "caerpd"."responsible_party_uuid" = "caep"."uuid"  LEFT JOIN "alcs"."local_government" "lg" ON  "lg"."uuid" = "caep"."local_government_uuid" AND "lg"."audit_deleted_date_at" IS NULL WHERE "cae"."audit_deleted_date_at" IS NULL',
      ],
    );
  }
}
