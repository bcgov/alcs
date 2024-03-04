SELECT count(*)
FROM oats.oats_alr_applications oaa
    JOIN alcs.notification n ON n.file_number = oaa.alr_application_id::TEXT
    AND n.type_code = 'SRW';