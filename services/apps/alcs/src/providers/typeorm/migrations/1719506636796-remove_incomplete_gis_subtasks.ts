import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveIncompleteGisSubtasks1719506636796 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`
            DELETE FROM alcs.card_subtask 
            USING alcs.notification
            WHERE alcs.card_subtask.card_uuid = alcs.notification.card_uuid
            AND alcs.card_subtask.type_code = 'GIS'
            AND alcs.card_subtask.completed_at IS NULL
            AND alcs.card_subtask.audit_created_by = 'alcs-api';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
