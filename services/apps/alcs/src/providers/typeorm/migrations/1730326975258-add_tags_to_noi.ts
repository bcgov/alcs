import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTagsToNoi1730326975258 implements MigrationInterface {
    name = 'AddTagsToNoi1730326975258'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "alcs"."notice_of_intent_tag" ("notice_of_intent_uuid" uuid NOT NULL, "tag_uuid" uuid NOT NULL, CONSTRAINT "PK_8ae82272ffcbd27427172fd5e11" PRIMARY KEY ("notice_of_intent_uuid", "tag_uuid"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2baab887c8e66032ba78750b91" ON "alcs"."notice_of_intent_tag" ("notice_of_intent_uuid") `);
        await queryRunner.query(`CREATE INDEX "IDX_404540b8fc70a267572f0d506a" ON "alcs"."notice_of_intent_tag" ("tag_uuid") `);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_tag" ADD CONSTRAINT "FK_2baab887c8e66032ba78750b912" FOREIGN KEY ("notice_of_intent_uuid") REFERENCES "alcs"."notice_of_intent"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_tag" ADD CONSTRAINT "FK_404540b8fc70a267572f0d506aa" FOREIGN KEY ("tag_uuid") REFERENCES "alcs"."tag"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_tag" DROP CONSTRAINT "FK_404540b8fc70a267572f0d506aa"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_tag" DROP CONSTRAINT "FK_2baab887c8e66032ba78750b912"`);
        await queryRunner.query(`DROP INDEX "alcs"."IDX_404540b8fc70a267572f0d506a"`);
        await queryRunner.query(`DROP INDEX "alcs"."IDX_2baab887c8e66032ba78750b91"`);
        await queryRunner.query(`DROP TABLE "alcs"."notice_of_intent_tag"`);
    }

}
