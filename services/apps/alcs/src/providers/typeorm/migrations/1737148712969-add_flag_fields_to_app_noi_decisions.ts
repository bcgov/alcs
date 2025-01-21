import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFlagFieldsToAppNoiDecisions1737148712969 implements MigrationInterface {
    name = 'AddFlagFieldsToAppNoiDecisions1737148712969'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision" ADD "is_flagged" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision" ADD "reason_flagged" text`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision" ADD "follow_up_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision" ADD "flag_edited_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision" ADD "flagged_by_uuid" uuid`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision" ADD "flag_edited_by_uuid" uuid`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision" ADD "is_flagged" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision" ADD "reason_flagged" text`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision" ADD "follow_up_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision" ADD "flag_edited_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision" ADD "flagged_by_uuid" uuid`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision" ADD "flag_edited_by_uuid" uuid`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision" ADD CONSTRAINT "FK_ba6fa8d1851029a9859afc35b03" FOREIGN KEY ("flagged_by_uuid") REFERENCES "alcs"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision" ADD CONSTRAINT "FK_93cde17558333a6f39d089928de" FOREIGN KEY ("flag_edited_by_uuid") REFERENCES "alcs"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision" ADD CONSTRAINT "FK_9b50f52d4c843ff2656ce04e575" FOREIGN KEY ("flagged_by_uuid") REFERENCES "alcs"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision" ADD CONSTRAINT "FK_8b3ab9ae1ef21da9ebe8b358a39" FOREIGN KEY ("flag_edited_by_uuid") REFERENCES "alcs"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision" DROP CONSTRAINT "FK_8b3ab9ae1ef21da9ebe8b358a39"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision" DROP CONSTRAINT "FK_9b50f52d4c843ff2656ce04e575"`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision" DROP CONSTRAINT "FK_93cde17558333a6f39d089928de"`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision" DROP CONSTRAINT "FK_ba6fa8d1851029a9859afc35b03"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision" DROP COLUMN "flag_edited_by_uuid"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision" DROP COLUMN "flagged_by_uuid"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision" DROP COLUMN "flag_edited_at"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision" DROP COLUMN "follow_up_at"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision" DROP COLUMN "reason_flagged"`);
        await queryRunner.query(`ALTER TABLE "alcs"."notice_of_intent_decision" DROP COLUMN "is_flagged"`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision" DROP COLUMN "flag_edited_by_uuid"`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision" DROP COLUMN "flagged_by_uuid"`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision" DROP COLUMN "flag_edited_at"`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision" DROP COLUMN "follow_up_at"`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision" DROP COLUMN "reason_flagged"`);
        await queryRunner.query(`ALTER TABLE "alcs"."application_decision" DROP COLUMN "is_flagged"`);
    }

}
