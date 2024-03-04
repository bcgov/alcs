SELECT oaa.alr_application_id,
    (
        CASE
            WHEN oaa.submitted_to_alc_date IS NULL
            AND MIN(oa.completion_date) IS NULL THEN NULL
            ELSE LEAST(
                COALESCE(oaa.submitted_to_alc_date, 'infinity'::timestamp),
                COALESCE(MIN(oa.completion_date), 'infinity'::timestamp)
            )
        END
    ) AS date_submitted_to_alc
FROM oats.oats_alr_applications oaa
    JOIN alcs.notification n ON n.file_number = oaa.alr_application_id::TEXT
    AND n.type_code = 'SRW'
    LEFT JOIN oats.oats_accomplishments oa ON oa.alr_application_id = oaa.alr_application_id
    AND oa.accomplishment_code = 'SAL'