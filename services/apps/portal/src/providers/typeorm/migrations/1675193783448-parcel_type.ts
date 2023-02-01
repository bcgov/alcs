import { MigrationInterface, QueryRunner } from "typeorm";

export class parcelType1675193783448 implements MigrationInterface {
    name = 'parcelType1675193783448'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "portal"."application_parcel" ADD "parcel_type" character varying NOT NULL DEFAULT 'application'`);
        await queryRunner.query(`COMMENT ON COLUMN "portal"."application_parcel"."parcel_type" IS 'The Parcels type, "other" means parcels not related to application but related to the owner'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "portal"."application_parcel"."parcel_type" IS 'The Parcels type, "other" means parcels not related to application but related to the owner'`);
        await queryRunner.query(`ALTER TABLE "portal"."application_parcel" DROP COLUMN "parcel_type"`);
    }

}
