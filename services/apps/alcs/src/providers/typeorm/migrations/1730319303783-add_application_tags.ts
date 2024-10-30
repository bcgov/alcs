import { MigrationInterface, QueryRunner } from "typeorm";

export class AddApplicationTags1730319303783 implements MigrationInterface {
    name = 'AddApplicationTags1730319303783'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "alcs"."application_tag" ("application_uuid" uuid NOT NULL, "tag_uuid" uuid NOT NULL, CONSTRAINT "PK_0b7e45b13295c030c1bf552523b" PRIMARY KEY ("application_uuid", "tag_uuid"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b3eb1df7fc12b1f93b9b294a49" ON "alcs"."application_tag" ("application_uuid") `);
        await queryRunner.query(`CREATE INDEX "IDX_9b7b9b172959a3cb5f9776f0ce" ON "alcs"."application_tag" ("tag_uuid") `);
        await queryRunner.query(`ALTER TABLE "alcs"."application_tag" ADD CONSTRAINT "FK_b3eb1df7fc12b1f93b9b294a491" FOREIGN KEY ("application_uuid") REFERENCES "alcs"."application"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_tag" ADD CONSTRAINT "FK_9b7b9b172959a3cb5f9776f0ce3" FOREIGN KEY ("tag_uuid") REFERENCES "alcs"."tag"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."application_tag" DROP CONSTRAINT "FK_9b7b9b172959a3cb5f9776f0ce3"`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_tag" DROP CONSTRAINT "FK_b3eb1df7fc12b1f93b9b294a491"`);
        await queryRunner.query(`DROP INDEX "alcs"."IDX_9b7b9b172959a3cb5f9776f0ce"`);
        await queryRunner.query(`DROP INDEX "alcs"."IDX_b3eb1df7fc12b1f93b9b294a49"`);
        await queryRunner.query(`DROP TABLE "alcs"."application_tag"`);
    }

}
