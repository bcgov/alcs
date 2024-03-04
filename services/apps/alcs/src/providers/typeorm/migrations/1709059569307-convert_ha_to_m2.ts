import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertHaToM21709059569307 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // create backup tables for application in public schema
    await queryRunner.query(`
        -- application_submission
        CREATE TABLE public.back_up_app_sub_ha_conversion (
            uuid UUID PRIMARY KEY,
            "file_number" TEXT,
            nfu_total_fill_area numeric(15, 5),
            soil_to_remove_area numeric(15, 5),
            soil_to_place_area numeric(15, 5),
            naru_to_place_area numeric(15, 5)
        );
        COMMENT ON TABLE public.back_up_app_sub_ha_conversion IS 'This is a backup table for application submissions values. Delete once confirmed that migration is successful.';

        INSERT INTO public.back_up_app_sub_ha_conversion
        SELECT
            "uuid",
            file_number ,
            nfu_total_fill_area ,
            soil_to_remove_area ,
            soil_to_place_area ,
            naru_to_place_area
        FROM
            alcs.application_submission as2
        WHERE
            as2.file_number::bigint < 100000
            AND audit_created_by = 'oats_etl'
            AND audit_updated_by IS NULL 
            AND (nfu_total_fill_area IS NOT NULL OR soil_to_remove_area IS NOT NULL OR soil_to_place_area IS NOT NULL OR naru_to_place_area IS NOT NULL);
        
        -- application_decision_component
        CREATE TABLE public.backup_app_dec_comp_ha_conversion (
            uuid UUID PRIMARY KEY,
            "file_number" TEXT,
            soil_to_remove_area numeric(15, 5),
            soil_to_place_area numeric(15, 5)
        );
        COMMENT ON TABLE public.backup_app_dec_comp_ha_conversion IS 'This is a backup table for application decisions components values. Delete once confirmed that migration is successful.';
        
        INSERT INTO public.backup_app_dec_comp_ha_conversion
        SELECT
            adc."uuid",
            a.file_number ,
            adc.soil_to_remove_area,
            adc.soil_to_place_area
        FROM
            alcs.application_decision_component adc
        JOIN alcs.application_decision ad ON
            ad."uuid" = adc.application_decision_uuid
        JOIN alcs.application a ON
            a."uuid" = ad.application_uuid
        WHERE
            a.file_number::bigint < 100000
            AND adc.audit_created_by = 'oats_etl'
            AND adc.audit_updated_by IS NULL
            AND (soil_to_remove_area IS NOT NULL OR soil_to_place_area IS NOT NULL );

    `);

    // update application
    await queryRunner.query(`
        UPDATE alcs.application_submission
        SET 
            nfu_total_fill_area = nfu_total_fill_area * 10000,
            soil_to_remove_area = soil_to_remove_area * 10000,
            soil_to_place_area = soil_to_place_area * 10000,
            naru_to_place_area = naru_to_place_area * 10000
        WHERE 
            file_number::bigint < 100000
            AND audit_created_by = 'oats_etl'
            AND audit_updated_by IS NULL;


        WITH components AS (
            SELECT
                a.file_number ,
                adc."uuid",
                adc.soil_to_remove_area,
                adc.soil_to_place_area
            FROM
                alcs.application_decision_component adc
            JOIN alcs.application_decision ad ON
                ad."uuid" = adc.application_decision_uuid
            JOIN alcs.application a ON
                a."uuid" = ad.application_uuid
            WHERE
                a.file_number::bigint < 100000
                AND adc.audit_created_by = 'oats_etl'
                AND adc.audit_updated_by IS NULL
                )
            UPDATE alcs.application_decision_component 
            SET soil_to_remove_area = components.soil_to_remove_area * 10000,
                soil_to_place_area = components.soil_to_place_area * 10000
            FROM components
            WHERE components.uuid = alcs.application_decision_component.uuid;
    `);

    // create backup tables for noi in public schema
    await queryRunner.query(`
            CREATE TABLE public.backup_noi_sub_ha_conversion (
                uuid UUID PRIMARY KEY,
                "file_number" TEXT,
                soil_to_remove_area numeric(15, 5),
                soil_to_place_area numeric(15, 5)
            );
            COMMENT ON TABLE public.backup_noi_sub_ha_conversion IS 'This is a backup table for noi submissions values. Delete once confirmed that migration is successful.';
            
            INSERT INTO public.backup_noi_sub_ha_conversion
            SELECT
                "uuid",
                file_number ,
                soil_to_remove_area ,
                soil_to_place_area 
            FROM
                alcs.notice_of_intent_submission nois 
            WHERE
                nois.file_number::bigint < 100000
                AND audit_created_by = 'oats_etl'
                AND audit_updated_by IS NULL
                AND (soil_to_remove_area IS NOT NULL OR soil_to_place_area IS NOT NULL);

            CREATE TABLE public.backup_noi_dec_comp_ha_conversion (
                uuid UUID PRIMARY KEY,
                "file_number" TEXT,
                soil_to_remove_area numeric(15, 5),
                soil_to_place_area numeric(15, 5)
            );
            COMMENT ON TABLE public.backup_noi_dec_comp_ha_conversion IS 'This is a backup table for noi decision components values. Delete once confirmed that migration is successful.';
            
            INSERT INTO public.backup_noi_dec_comp_ha_conversion
            SELECT
                ndc."uuid",
                noi.file_number ,
                ndc.soil_to_remove_area,
                ndc.soil_to_place_area
            FROM
                alcs.notice_of_intent_decision_component ndc
            JOIN alcs.notice_of_intent_decision nd ON
                nd."uuid" = ndc.notice_of_intent_decision_uuid
            JOIN alcs.notice_of_intent noi ON
                noi."uuid" = nd.notice_of_intent_uuid
            WHERE
                noi.file_number::bigint < 100000
                AND ndc.audit_created_by = 'oats_etl'
                AND ndc.audit_updated_by IS NULL
                AND (ndc.soil_to_remove_area IS NOT NULL OR ndc.soil_to_place_area IS NOT NULL);
    `);

    // update noi
    await queryRunner.query(`
            UPDATE alcs.notice_of_intent_submission 
            SET 
                soil_to_remove_area = soil_to_remove_area * 10000,
                soil_to_place_area = soil_to_place_area * 10000
            WHERE 
                file_number::bigint < 100000
                AND audit_created_by = 'oats_etl'
                AND audit_updated_by IS NULL;
                
            WITH components AS (
                SELECT
                    noi.file_number,
                    ndc."uuid",
                    ndc.soil_to_remove_area,
                    ndc.soil_to_place_area
                FROM
                    alcs.notice_of_intent_decision_component ndc
                JOIN alcs.notice_of_intent_decision nd ON
                    nd."uuid" = ndc.notice_of_intent_decision_uuid
                JOIN alcs.notice_of_intent noi ON
                    noi."uuid" = nd.notice_of_intent_uuid
                WHERE
                    noi.file_number::bigint < 100000
                    AND ndc.audit_created_by = 'oats_etl'
                    AND ndc.audit_updated_by IS NULL
                    )
            UPDATE alcs.notice_of_intent_decision_component 
            SET soil_to_remove_area = components.soil_to_remove_area * 10000,
                soil_to_place_area = components.soil_to_place_area * 10000
            FROM components
            WHERE components.uuid = alcs.notice_of_intent_decision_component.uuid;    
    `);
  }

  public async down(): Promise<void> {
    // not needed
  }
}
